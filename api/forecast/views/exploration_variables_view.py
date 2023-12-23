import datetime

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from database.db_engine import engine
from files.file_model import FileRefModel
from django.db import connection
import pandas as pd


class FilterValuesView (APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        project_pk = request.data.get('project_id')
        filter_name = request.data.get('filter_name')

        hsd = FileRefModel.objects.filter(project_id=project_pk, model_type_id=1).first()

        with connection.cursor() as cursor:
            cursor.execute(f'SELECT DISTINCT({filter_name}) FROM {hsd.file_name}')
            rows = cursor.fetchall()
            filter_names = []

            for row in rows:
                filter_names.append(row[0])

        return Response(filter_names, status=status.HTTP_200_OK)


class HistoricalDataView (APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        project_pk = request.data.get('project_id')
        filter_name = request.data.get('filter_name')
        filter_value = request.data.get('filter_value')

        hsd = FileRefModel.objects.filter(project_id=project_pk, model_type_id=1).first()

        if filter_name == 'all':
            hsd_table = pd.read_sql_table(table_name=hsd.file_name, con=engine)

        else:
            with connection.cursor() as cursor:
                cursor.execute(f'SELECT * FROM {hsd.file_name} WHERE {filter_name} = "{filter_value}"')

                data_rows = cursor.fetchall()

                cursor.execute(f'SELECT name FROM pragma_table_info("{hsd.file_name}")')
                columns = cursor.fetchall()

                """  
                    SQL QUERY FOR MYSQL
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = 'database_name' AND TABLE_NAME = 'table_name';
                """
                hsd_table = pd.DataFrame(columns=columns, data=data_rows)

        date_columns_hsd = hsd_table.columns[12:]

        hsd_sum = hsd_table[date_columns_hsd].sum()

        hsd_data = {'x': date_columns_hsd.to_list(), 'y': hsd_sum.to_list()}

        return Response(hsd_data, status=status.HTTP_200_OK)


class AllocationMatrixView(APIView):

    @staticmethod
    def obtain_data(exog_data: str, historical_data: str, filter_by: str) -> tuple[pd.DataFrame, pd.DataFrame, list]:
        columns_to_delete_hsd = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'SKU', 'Description',
                                 'Subcategory', 'Starting Year', 'Starting Period',
                                 'Periods Per Year', 'Periods Per Cycle']

        columns_to_delete_exog = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'SKU', 'Subcategory']

        columns_to_delete_exog.remove(filter_by)
        columns_to_delete_hsd.remove(filter_by)

        df_exog_data = pd.read_sql_table(table_name=exog_data, con=engine)
        df_historical_data = pd.read_sql_table(table_name=historical_data, con=engine)

        df_historical_data.drop(columns=columns_to_delete_hsd, inplace=True)
        df_exog_data.drop(columns=columns_to_delete_exog, inplace=True)

        list_of_variables = []

        with connection.cursor() as cursor:
            query = f'SELECT DISTINCT(Variable) FROM {exog_data}'
            cursor.execute(query)
            data = cursor.fetchall()
            for i in data:
                list_of_variables.append(i[0])

        return df_exog_data, df_historical_data, list_of_variables

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        project_pk = request.data.get('project_id')
        filter_by = request.data.get('filter_value')
        hsd = FileRefModel.objects.filter(project_id=project_pk, model_type_id=1).first()
        exog = FileRefModel.objects.filter(project_id=project_pk, model_type_id=2).first()

        if exog is None:
            return Response({'error': 'not_exog_data'}, status=status.HTTP_400_BAD_REQUEST)

        historical_data_table = hsd.file_name
        exog_data_table = exog.file_name

        df_historical_exogenous, df_historical_data, variable_names = self.obtain_data(exog_data=exog_data_table,
                                                            historical_data=historical_data_table, filter_by=filter_by)

        df_historical_data = df_historical_data.set_index(filter_by).T

        df_historical_exogenous = df_historical_exogenous.set_index(['Variable', filter_by]).T

        correlation = {}
        for filter_value in df_historical_data.columns:
            dataframes = []
            for var_name in variable_names:
                dataframes.append(df_historical_exogenous[var_name][filter_value])

            dataframes.insert(0, df_historical_data[filter_value])
            combined_data = pd.concat(dataframes, axis=1)

            correlation_matrix = combined_data.corr()
            correlation[filter_value] = {
                var_name: correlation_matrix.iloc[0, idx] for idx, var_name in enumerate(variable_names, start=1)
            }

        return Response(correlation, status=status.HTTP_200_OK)