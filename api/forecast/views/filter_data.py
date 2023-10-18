from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from ..serializer import FilterData
from projects.models import ProjectsModel
from ..models import ForecastScenario
from django.db import connection
import pandas as pd
from ..graphic_predictions_per_year import graphic_predictions_per_year
from datetime import datetime


class FilterDataViews(APIView):
    @staticmethod
    def convert_to_yyyymmdd(date_str):
        try:
            date_datetime = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            try:
                date_datetime = datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                return None

        return date_datetime.strftime('%Y-%m-%d')

    @staticmethod
    def obtain_columns(columns: list) -> list:
        model_index = None
        for i, column_name in enumerate(columns):
            if column_name == ('model',):
                model_index = i
                break

        mape_index = None
        for i, column_name in enumerate(columns):
            if column_name == ('MAPE',):
                mape_index = i
                break

        if model_index is None or mape_index is None:
            return None

        date_columns = [valor[0] for valor in columns[model_index + 1:mape_index]]

        return date_columns

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
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
                cursor.execute(f'SELECT * FROM {table_name} WHERE {filter_name} = %s', [filter_value])
                data_rows = cursor.fetchall()

                cursor.execute(f'SELECT name FROM pragma_table_info("{table_name}")')
                columns = cursor.fetchall()

                """  
                    SQL QUERY FOR MYSQL
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = 'database_name' AND TABLE_NAME = 'table_name';

                """
                df_pred = pd.DataFrame(data=data_rows, columns=columns)
                df_pred = df_pred.drop(columns=[('MAPE',)])
                actual_rows = df_pred[df_pred[('model',)] == 'actual']
                other_rows = df_pred[df_pred[('model',)] != 'actual']

                date_columns = [str(col[0]) for col in df_pred.columns[9:]]

                actual_sum = actual_rows[df_pred.columns[9:]].sum()

                other_sum = other_rows[df_pred.columns[9:]].sum()

                actual_data = {'x': date_columns, 'y': actual_sum.tolist()}
                other_data = {'x': date_columns, 'y': other_sum.tolist()}

                final_data = {'actual_data': actual_data, 'other_data': other_data}
                data_per_year = graphic_predictions_per_year(final_data)

                return Response({"full_data": final_data, "year_data": data_per_year},
                                status=status.HTTP_200_OK)

        else:
            return Response({'error': 'bad_request', 'logs': filters.errors}, status=status.HTTP_400_BAD_REQUEST)


class GetFiltersView(APIView):

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            project_id = filters.validated_data['project_id']
            filter_name = filters.validated_data['filter_name']
            project = ProjectsModel.objects.filter(pk=project_id).first()
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            table_name = f'Historical_Data_{project.project_name}_user{project.user_owner_id}_prediction_results_scenario_{scenario.scenario_name}'

            with connection.cursor() as cursor:
                cursor.execute(f'SELECT DISTINCT({filter_name}) FROM {table_name}')
                rows = cursor.fetchall()
                filter_names = []

                for row in rows:
                    filter_names.append(row[0])

                return Response(filter_names, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'bad_request', 'logs': filters.errors}, status=status.HTTP_400_BAD_REQUEST)