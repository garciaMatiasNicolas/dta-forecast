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
from ..mape_cacl import mape_calc_reports


class MapeReportAPIView(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)
        product = request.data.get("product")


        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            filter_name = filters.validated_data['filter_name']
            filter_value = filters.validated_data['filter_value']
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            table_name = scenario.predictions_table_name

            if product:
                query = f'''
                SELECT
                SKU|| ' ' ||DESCRIPTION AS product, 
                ROUND(MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END),2) AS actual, 
                ROUND(MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END),2) AS fit 
                FROM {table_name} WHERE SKU = {product}
                GROUP BY SKU, DESCRIPTION;
                '''

            else:
                query = f'''
                SELECT
                SKU|| ' ' ||DESCRIPTION AS product, 
                ROUND(MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END),2) AS actual, 
                ROUND(MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END),2) AS fit 
                FROM {table_name} GROUP BY SKU, DESCRIPTION;
                '''

            try:
                with connection.cursor() as cursor:
                    cursor.execute(query)

                    rows = cursor.fetchall()
                    data_to_return = []

                    for index, row in enumerate(rows):
                        actual_val = row[1]
                        predicted_val = row[2]
                        mape = mape_calc_reports(predicted=predicted_val, actual=actual_val)
                        new_data = list(row)
                        new_data.append(mape)
                        data_to_return.append(new_data)

                return Response(data_to_return, status=status.HTTP_200_OK)

            except Exception as err:
                print(err)
                return Response({'error': 'database_error'}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'bad_request', 'logs': filters.errors}, status=status.HTTP_400_BAD_REQUEST)


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
            filter_name = filters.validated_data['filter_name']
            filter_value = filters.validated_data['filter_value']

            last_year_months = self.obtain_last_year_months()
            mape_values = []

            if filter_name == "date":
                for date in last_year_months:
                    with connection.cursor() as cursor:

                        query = f'''
                           SELECT
                           ROUND(MAX(CASE WHEN MODEL = 'actual' THEN {date} END),2) AS actual, 
                           ROUND(MAX(CASE WHEN MODEL != 'actual' THEN {date} END),2) AS fit 
                           FROM {table_name} GROUP BY SKU, DESCRIPTION;
                        '''
                        cursor.execute(query)
                        rows = cursor.fetchall()
                        mape_values_by_date = []

                        for row in rows:
                            actual_val = row[0]
                            predicted_val = row[1]
                            mape = mape_calc_reports(actual=actual_val, predicted=predicted_val)
                            mape_values_by_date.append(mape)

                    mape_values.append(round(sum(mape_values_by_date) / len(mape_values_by_date), 2))

            else:
                for date in last_year_months:
                    with connection.cursor() as cursor:
                        if filter_name == 'sku':
                            query = f'''
                                SELECT
                                ROUND(MAX(CASE WHEN MODEL = 'actual' THEN {date} END),2) AS actual, 
                                ROUND(MAX(CASE WHEN MODEL != 'actual' THEN {date} END),2) AS fit 
                                FROM {table_name} WHERE {filter_name} = {filter_value}
                                GROUP BY SKU, DESCRIPTION;
                            '''

                        else:
                            query = f'''
                                SELECT
                                ROUND(MAX(CASE WHEN MODEL = 'actual' THEN {date} END),2) AS actual, 
                                ROUND(MAX(CASE WHEN MODEL != 'actual' THEN {date} END),2) AS fit 
                                FROM {table_name} WHERE {filter_name} = '{filter_value}'
                                GROUP BY SKU, DESCRIPTION;
                            '''

                        cursor.execute(query)
                        rows = cursor.fetchall()
                        mape_values_by_date = []

                        for row in rows:
                            actual_val = row[0]
                            predicted_val = row[1]
                            mape = mape_calc_reports(actual=actual_val, predicted=predicted_val)
                            mape_values_by_date.append(mape)

                    mape_values.append(round(sum(mape_values_by_date) / len(mape_values_by_date), 2))

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
