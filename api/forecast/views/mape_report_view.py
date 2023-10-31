from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from projects.models import ProjectsModel
from ..models import ForecastScenario
from ..serializer import FilterData
from django.db import connection


class MapeReportAPIView(APIView):

    def post(self, request):
        filters = FilterData(data=request.data)

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            project_id = filters.validated_data['project_id']
            filter_name = filters.validated_data['filter_name']
            filter_value = filters.validated_data['filter_value']
            project = ProjectsModel.objects.filter(pk=project_id).first()
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            table_name = f'Historical_Data_{project.project_name}_user{project.user_owner_id}_prediction_results_scenario_{scenario.scenario_name}'

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
    def post(self, request):
        filters = FilterData(data=request.data)

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            project_id = filters.validated_data['project_id']
            filter_name = filters.validated_data['filter_name']
            filter_value = filters.validated_data['filter_value']
            project = ProjectsModel.objects.filter(pk=project_id).first()
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            table_name = f'Historical_Data_{project.project_name}_user{project.user_owner_id}_prediction_results_scenario_{scenario.scenario_name}'

            query = f'''
                    SELECT ROUND(AVG(MAPE), 2)
                    FROM (
                      SELECT 
                        ROUND(
                          CASE
                            WHEN MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END) = 0 
                            THEN 100 - MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END)
                            ELSE MAX(CASE WHEN MODEL = 'actual' THEN "{filter_value}" END) - 
                            MAX(CASE WHEN MODEL != 'actual' THEN "{filter_value}" END)
                          END, 2
                        ) AS MAPE
                      FROM {table_name} GROUP BY SKU, DESCRIPTION) AS MAPE_Subquery;
            '''

            with connection.cursor() as cursor:

                cursor.execute(query)
                data_rows = cursor.fetchall()

                print(data_rows)


