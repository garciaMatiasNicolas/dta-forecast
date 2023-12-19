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


class FilterDataViews(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            filter_name = filters.validated_data['filter_name']
            filter_value = filters.validated_data['filter_value']
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            error_method = scenario.error_type
            table_name = scenario.predictions_table_name
            pred_p = scenario.pred_p

            with connection.cursor() as cursor:
                cursor.execute(f'SELECT * FROM {table_name} WHERE {filter_name} = "{filter_value}"')
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
                df_pred = df_pred.drop(columns=[(error_method,)])
                actual_rows = df_pred[df_pred[('model',)] == 'actual']
                other_rows = df_pred[df_pred[('model',)] != 'actual']

                date_columns = [str(col[0]) for col in df_pred.columns[9:]]

                actual_sum = actual_rows[df_pred.columns[9:]].sum()

                other_sum = other_rows[df_pred.columns[9:]].sum()

                actual_data = {'x': date_columns, 'y': actual_sum.tolist()}
                other_data = {'x': date_columns, 'y': other_sum.tolist()}

                dates = actual_data['x'][:-pred_p]
                values = actual_data['y'][:-pred_p]

                actual_data['x'] = dates
                actual_data['y'] = values

                final_data = {'actual_data': actual_data, 'other_data': other_data}
                data_per_year = graphic_predictions_per_year(final_data, max_date=scenario.max_historical_date)

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
            filter_name = filters.validated_data['filter_name']
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            table_name = scenario.predictions_table_name

            if filter_name == 'date':
                with connection.cursor() as cursor:
                    cursor.execute(f'SELECT name FROM pragma_table_info("{table_name}")')
                    columns = cursor.fetchall()

                date_columns = [x[0] for x in columns if len(x) == 1 and x[0].count('-') == 2]
                date_columns_str = [str(x).split()[0] if date_columns.index(x) == 0 else str(x) for x in date_columns]
                
                return Response(date_columns_str, status=status.HTTP_200_OK)

            else:
                with connection.cursor() as cursor:
                    cursor.execute(f'SELECT DISTINCT({filter_name}) FROM {table_name}')
                    rows = cursor.fetchall()
                    filter_names = []

                    for row in rows:
                        filter_names.append(row[0])

                    return Response(filter_names, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'bad_request', 'logs': filters.errors}, status=status.HTTP_400_BAD_REQUEST)



