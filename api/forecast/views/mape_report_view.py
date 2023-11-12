from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from projects.models import ProjectsModel
from ..models import ForecastScenario
from ..serializer import FilterData
from django.db import connection
from datetime import datetime
from ..mape_cacl import mape_calc_by_month


class MapeReportAPIView(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            filter_name = filters.validated_data['filter_name']
            filter_value = filters.validated_data['filter_value']
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            table_name = scenario.predictions_table_name

            with connection.cursor() as cursor:
                cursor.execute(f'''
                      SELECT 
                      SKU, 
                      DESCRIPTION,
                      ROUND(MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END), 2) AS actual,
                      ROUND(MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END), 2) AS fit,
                      ROUND(
                        CASE
                          WHEN MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END) = 0 
                          THEN 100 - MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END)
                          ELSE MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END) - 
                          MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END)
                        END, 2
                      ) FROM {table_name} GROUP BY SKU, DESCRIPTION;''')

                rows = cursor.fetchall()

                data_to_return = []

                for row in rows:
                    row_to_list = list(row)
                    data_to_return.append(row_to_list)

                return Response(data_to_return, status=status.HTTP_200_OK)


class MapeGraphicView(APIView):
    @staticmethod
    def obtain_last_year_months() -> list:
        actual_date = datetime.now().date()
        months = []

        for month in range(12):
            year = actual_date.year
            if actual_date.month - month <= 0:
                year -= 1
            date = datetime(year, (actual_date.month - month - 1) % 12 + 1, 1)
            months.append(f'"{date.strftime("%Y-%m-%d")}"')

        return months

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            table_name = scenario.predictions_table_name

            last_year_months = self.obtain_last_year_months()
            columns = ', '.join(last_year_months)

            with connection.cursor() as cursor:
                cursor.execute(f'SELECT {columns} FROM {table_name}')
                data_rows = cursor.fetchall()
                data_rows = list(zip(*data_rows))
                print(f'SELECT {columns} FROM {table_name}')
                mape_values = mape_calc_by_month(data=data_rows)
                for mape in mape_values:
                    list(mape_values)
                    mape_values.append(mape[0])

                list_months = []

                for month in last_year_months:
                    month = datetime.strptime(month, '%Y-%m-%d').date()
                    list_months.append(month)

                data = {"x": list_months, "y": mape_values}
                return Response(data, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'bad_request', 'logs': filters.errors},
                            status=status.HTTP_400_BAD_REQUEST)