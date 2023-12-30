from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import authentication_classes, permission_classes, action
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

    @staticmethod
    def join_dates(list_dates: list, for_report: bool):
        if for_report:
            dates_joined = " + ".join([f"SUM(\"{date}\")" for date in list_dates])
        else:
            dates_joined = ",\n".join([f"SUM(\"{date}\") as \"{date.split('-')[0]}\"" for date in list_dates])

        return dates_joined

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        project_pk = request.data.get('project_id')
        filter_name = request.data.get('filter_name')

        hsd = FileRefModel.objects.filter(project_id=project_pk, model_type_id=1).first()
        columns_to_delete_hsd = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'SKU', 'Description',
                                 'Subcategory', 'Starting Year', 'Starting Period',
                                 'Periods Per Year', 'Periods Per Cycle']

        if filter_name == 'all':
            hsd_table = pd.read_sql_table(table_name=hsd.file_name, con=engine)
            date_columns_hsd = hsd_table.columns[12:]
            hsd_sum = hsd_table[date_columns_hsd].sum()
            hsd_data = {'x': date_columns_hsd.to_list(), 'y': hsd_sum.to_list()}
            return Response(data=hsd_data, status=status.HTTP_200_OK)

        else:
            with connection.cursor() as cursor:
                cursor.execute(f'SELECT name FROM pragma_table_info("{hsd.file_name}")')
                columns = cursor.fetchall()
                columns_date = []

                for col in columns:
                    if col[0] not in columns_to_delete_hsd:
                        columns_date.append(col[0])

                sum_columns = ', '.join([f'SUM("{date}")' for date in columns_date])

                """  
                    SQL QUERY FOR MYSQL
                    SELECT COLUMN_NAME
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = 'database_name' AND TABLE_NAME = 'table_name';
                """

                cursor.execute(f'SELECT {filter_name}, {sum_columns} FROM {hsd.file_name} GROUP BY {filter_name}')
                data = cursor.fetchall()

        data_dict = {
            'x': columns_date,
            'y': {}
        }

        for item in data:
            category_name = item[0]
            sales_values = item[1:]
            data_dict['y'][category_name] = sales_values

        return Response(data=data_dict, status=status.HTTP_200_OK)


class AllocationMatrixView(APIView):

    @staticmethod
    def obtain_data(exog_data: str, historical_data: str, filter_by: str, var_name):
        columns_to_delete_hsd = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'SKU', 'Description',
                                 'Subcategory', 'Starting Year', 'Starting Period',
                                 'Periods Per Year', 'Periods Per Cycle']

        columns_to_delete_exog = ['Family', 'Region', 'Salesman', 'Client', 'Category', 'SKU', 'Subcategory']

        df_exog_data = pd.read_sql_table(table_name=exog_data, con=engine)
        df_historical_data = pd.read_sql_table(table_name=historical_data, con=engine)

        columns_to_delete_exog.remove(filter_by)
        columns_to_delete_hsd.remove(filter_by)

        df_historical_data.drop(columns=columns_to_delete_hsd, inplace=True)
        df_exog_data.drop(columns=columns_to_delete_exog, inplace=True)

        df_exog_data_copy = df_exog_data[df_exog_data['Variable'] == var_name].copy()

        if df_exog_data_copy[filter_by].values[0] == 'all_data':
            df_historical_data[filter_by] = filter_by
            df_exog_data_copy[filter_by] = filter_by

        elif df_exog_data_copy[filter_by].values[0] == 'nan':
            raise ValueError("Exogenous_Variable_not_apply")

        else:
            df_historical_data = df_historical_data[df_historical_data[filter_by].isin(df_exog_data_copy[filter_by])]

        return df_exog_data_copy, df_historical_data

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        project_pk = request.data.get('project_id')
        filter_by = request.data.get('filter_value')
        exog_variable = request.data.get('exog_variable')
        hsd = FileRefModel.objects.filter(project_id=project_pk, model_type_id=1).first()
        exog = FileRefModel.objects.filter(project_id=project_pk, model_type_id=2).first()

        if exog is None:
            return Response(data={'error': 'not_exog_data'}, status=status.HTTP_400_BAD_REQUEST)

        historical_data_table = hsd.file_name
        exog_data_table = exog.file_name

        try:
            df_historical_exogenous, df_historical_data = self.obtain_data(exog_data=exog_data_table,
                                                                        filter_by=filter_by,
                                                                        historical_data=historical_data_table,
                                                                        var_name=exog_variable)

            df_historical_data = df_historical_data.set_index(filter_by).T
            df_historical_exogenous = df_historical_exogenous.set_index(['Variable', filter_by]).T

            correlation = {}

            for filter_value in df_historical_data.columns:
                dataframes = [df_historical_exogenous[exog_variable][filter_value]]
                dataframes.insert(0, df_historical_data[filter_value])

                combined_data = pd.concat(dataframes, axis=1)
                
                correlation_matrix = combined_data.corr()
                avg_correlation = correlation_matrix.mean().mean()
                correlation[filter_value] = {exog_variable: avg_correlation}

            sorted_data = dict(sorted(correlation.items(), key=lambda x: x[1][exog_variable], reverse=False))

            return Response(data=sorted_data, status=status.HTTP_200_OK)

        except ValueError as e:
            if str(e) == "Exogenous_Variable_not_apply":
                return Response({'error': 'exog_var_not_apply'}, status=status.HTTP_400_BAD_REQUEST)

            else:
                print(str(e))
                return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetExogVars(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        project_pk = request.data.get('project_id')
        exog = FileRefModel.objects.filter(project_id=project_pk, model_type_id=2).first()

        if exog is None:
            return Response({'error': 'not_exog_data'}, status=status.HTTP_400_BAD_REQUEST)

        list_of_variables = []

        with connection.cursor() as cursor:
            query = f'SELECT DISTINCT(Variable) FROM {exog.file_name}'
            cursor.execute(query)
            data = cursor.fetchall()
            for i in data:
                list_of_variables.append(i[0])

        return Response(list_of_variables, status=status.HTTP_200_OK)


