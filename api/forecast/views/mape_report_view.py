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
            query = f'''
                SELECT
                SKU,
                DESCRIPTION,
                MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END) AS actual,
                MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END) AS fit,
                ROUND(
                    CASE
                        WHEN MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END) = 0 AND MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END) = 0
                        THEN 0 
                        WHEN MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END) = 0
                        THEN 100
                        ELSE ABS(MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END) - MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END) / MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END)) * 100
                    END, 2
                ) AS MAPE
                FROM {table_name} GROUP BY SKU, DESCRIPTION;
            '''
            with connection.cursor() as cursor:
                cursor.execute(query)

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
            months.append(date.strftime('"%Y-%m-%d"'))

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

            mape_values = []
            for date in last_year_months:
                with connection.cursor() as cursor:
                    query = f'''
                        SELECT ROUND(AVG(MAPE), 2) AS MAPE
                        FROM (
                            SELECT
                                ROUND(
                                    CASE
                                        WHEN MAX(CASE WHEN MODEL = 'actual' THEN {date} END) = 0 
                                        AND MAX(CASE WHEN MODEL != 'actual' THEN {date} END) = 0
                                        THEN 0 
                                        WHEN MAX(CASE WHEN MODEL = 'actual' THEN {date} END) = 0
                                        THEN 100
                                        ELSE ABS(MAX(CASE WHEN MODEL = 'actual' THEN {date} END) 
                                        - MAX(CASE WHEN MODEL != 'actual' THEN {date} END) 
                                        / MAX(CASE WHEN MODEL = 'actual' THEN {date} END)) * 100
                                    END, 2
                                ) AS MAPE
                            FROM {table_name}
                            GROUP BY SKU
                        ) AS Subquery;
                    '''
                    cursor.execute(query)
                    data = cursor.fetchall()
                    mape_values.append(data[0][0])

            dates = []
            for date_str in last_year_months:
                date_str = date_str.strip('"')
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                formatted_date = date_obj.strftime("%Y-%m-%d")
                dates.append(formatted_date)

            return Response({'x': dates, 'y': mape_values}, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'bad_request', 'logs': filters.errors},
                            status=status.HTTP_400_BAD_REQUEST)