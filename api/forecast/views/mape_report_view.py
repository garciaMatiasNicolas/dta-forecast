from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from ..models import ForecastScenario
from ..serializer import FilterData
from django.db import connection
from datetime import datetime
from ..Error import Error
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
import os
import pandas as pd

class ForecastModelsSelctedGraphAPIView(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        sc_id = request.data.get('sc_id')
        product = request.data.get('product')

        scenario = get_object_or_404(ForecastScenario, pk=sc_id)
        table = scenario.predictions_table_name

        # Leer el archivo de Excel en un DataFrame de pandas
        try:
            with connection.cursor() as cursor:
                conditions = " AND ".join([f"{key} = '{value}'" for key, value in product.items()])
                query = f'SELECT * FROM {table} WHERE {conditions}'
                query_for_best_model = f'SELECT model FROM {table} WHERE {conditions} AND best_model = 1'

                cursor.execute(query)
                result = cursor.fetchall()

                columns = [col[0] for col in cursor.description]
                product_data = pd.DataFrame(result, columns=columns)

                cursor.execute(query_for_best_model)
                best_model = cursor.fetchall()
                for model in best_model:
                    best_model = model[0]

            product_data = product_data.drop(columns=["Family", "Region", "Client", "Subcategory", "Category", "SKU", "Description", "Salesman","LAST ERROR", "best_model"])

            dates = [col for col in product_data.columns if col.startswith('20')]

            # Convertir los datos a un formato adecuado para JSON
            data_for_chart = {
                "dates": dates,  # Las fechas
                "models": [], 
                "error": [],
                "error_type": scenario.error_type,
                "best_model": best_model
            }

            errors = []

            # Iterar sobre las filas del DataFrame winner_model
            for index, row in product_data.iterrows():
                model_name = row['model']
                error_value = row[scenario.error_type]
                
                # Crear un diccionario donde la clave es el nombre del modelo y el valor es el error
                model_error = {"name": model_name, "value": error_value}
                
                # Agregar el diccionario a la lista de errores
                errors.append(model_error)

            # Agregar la lista de errores a la estructura de datos para el gráfico
            data_for_chart['error'] = errors

            # Iterar sobre cada modelo para agregar sus datos
            for _, row in product_data.iterrows():
                model_data = {
                    "name": row['model'],
                    "values": row[1:].tolist()  # Los valores de ventas para ese modelo
                }

                data_for_chart["models"].append(model_data)

            # Retornar los datos como JSON
            return Response(data=data_for_chart, status=200)
            
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=500)



class ErrorReportAPIView(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)
        product = request.data.get("product")

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            filter_value = filters.validated_data['filter_value']
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            error_method = scenario.error_type
            table_name = scenario.predictions_table_name

            if product:
                query =  f'''
                SELECT
                CONCAT(SKU, " ", DESCRIPTION) AS product, 
                ROUND(MAX(CASE WHEN MODEL = 'actual' THEN `{filter_value}` END),2) AS actual, 
                ROUND(MAX(CASE WHEN MODEL != 'actual' THEN `{filter_value}` END),2) AS fit 
                FROM {table_name} WHERE SKU = "{product}" AND (model = "actual" OR best_model = 1)
                GROUP BY SKU, DESCRIPTION;
                '''

            else:
                query = f'''
                SELECT
                CONCAT(SKU, " ", DESCRIPTION) AS product, 
                ROUND(MAX(CASE WHEN MODEL = 'actual' THEN `{filter_value}` END),2) AS actual, 
                ROUND(MAX(CASE WHEN MODEL != 'actual' THEN `{filter_value}` END),2) AS fit 
                FROM {table_name} WHERE model = "actual" OR best_model = 1 GROUP BY SKU, DESCRIPTION;
                '''

            methods = {
                'MAPE': Error.calculate_mape,
                'SMAPE': Error.calculate_smape,
                'RMSE': Error.calculate_rmse,
                'MAE': Error.calculate_mae
            }

            try:
                with connection.cursor() as cursor:
                    cursor.execute(query)

                    rows = cursor.fetchall()
                    data_to_return = []

                    for index, row in enumerate(rows):
                        actual_val = row[1]
                        predicted_val = row[2]

                        if error_method in methods:
                            calc_error = methods[error_method]
                            error = calc_error(predicted_val, actual_val)

                        new_data = list(row)
                        new_data.append(error)
                        data_to_return.append(new_data)

                return Response(data_to_return, status=status.HTTP_200_OK)

            except Exception as err:
                print(err)
                return Response({'error': 'database_error'}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'bad_request', 'logs': filters.errors}, status=status.HTTP_400_BAD_REQUEST)


class ErrorGraphicView(APIView):
    @property
    def methods(self):
        methods = {
            'MAPE': Error.calculate_mape,
            'SMAPE': Error.calculate_smape,
            'RMSE': Error.calculate_rmse,
            'MAE': Error.calculate_mae
        }
        return methods

    @staticmethod
    def obtain_last_year_months(start_date, periods) -> list:
        # Crea una lista para almacenar las fechas
        date_list = []
        
        # Genera las fechas de cada periodo
        for i in range(periods):
            new_date = start_date + relativedelta(months=i)
            date_list.append(new_date.strftime("%Y-%m-%d"))
        
        return date_list

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)

        try:
            if filters.is_valid():
                scenario_id = filters.validated_data['scenario_id']
                scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
                table_name = scenario.predictions_table_name
                filter_name = filters.validated_data['filter_name']
                filter_value = filters.validated_data['filter_value']
                error_method = scenario.error_type
                max_date = scenario.max_historical_date
                pred_periods = scenario.pred_p

                last_year_months = self.obtain_last_year_months(max_date, pred_periods)
                error_values = []

                if filter_name == "date":
                    for date in last_year_months[-12:]:
                        with connection.cursor() as cursor:
                            
                            query = f'''
                            SELECT
                                ROUND(MAX(CASE WHEN MODEL = 'actual' THEN `{date}` END),2) AS actual, 
                                ROUND(MAX(CASE WHEN MODEL != 'actual' THEN `{date}` END),2) AS fit 
                                FROM {table_name} WHERE model = "actual" OR best_model = 1 GROUP BY SKU, DESCRIPTION;
                            '''

                            cursor.execute(query)
                            rows = cursor.fetchall()
                            error_values_by_date = []

                            for row in rows:
                                actual_val = row[0]
                                predicted_val = row[1]

                                if error_method in self.methods:
                                    calc_error = self.methods[error_method]
                                    error = calc_error(predicted_val, actual_val)

                                error_values_by_date.append(error)

                        error_values.append(round(sum(error_values_by_date) / len(error_values_by_date), 2))

                else:
                    for date in last_year_months[-12:]:
                        with connection.cursor() as cursor:
                            if filter_name == 'sku':
                                query = f'''
                                    SELECT
                                        ROUND(MAX(CASE WHEN MODEL = 'actual' THEN `{date}` END),2) AS actual, 
                                        ROUND(MAX(CASE WHEN MODEL != 'actual' THEN `{date}` END),2) AS fit 
                                        FROM {table_name} WHERE {filter_name} = {filter_value} AND (model = "actual" OR best_model = 1)
                                        GROUP BY SKU, DESCRIPTION;
                                '''

                            else:
                                query =  f'''
                                    SELECT
                                    ROUND(MAX(CASE WHEN MODEL = 'actual' THEN `{date}` END),2) AS actual, 
                                    ROUND(MAX(CASE WHEN MODEL != 'actual' THEN `{date}` END),2) AS fit 
                                    FROM {table_name} WHERE {filter_name} = '{filter_value}' AND (model = "actual" OR best_model = 1)
                                    GROUP BY SKU, DESCRIPTION;
                                '''
                            
                            cursor.execute(query)
                            rows = cursor.fetchall()
                            error_values_by_date = []

                            for row in rows:
                                actual_val = row[0]
                                predicted_val = row[1]

                                if error_method in self.methods:
                                    calc_error = self.methods[error_method]
                                    error = calc_error(predicted_val, actual_val)

                                error_values_by_date.append(error)

                        error_values.append(round(sum(error_values_by_date) / len(error_values_by_date), 2))

                dates = []
                for date_str in last_year_months:
                    date_str = date_str.strip('"')
                    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                    formatted_date = date_obj.strftime("%Y-%m-%d")
                    dates.append(formatted_date)

                return Response({'x': dates, 'y': error_values}, status=status.HTTP_200_OK)

            else:
                return Response({'error': 'bad_request', 'logs': filters.errors},
                                status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as err:
            print(err)
