from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from ..models import ForecastScenario
from database.db_engine import engine
from django.db import connection
import pandas as pd
from files.file_model import FileRefModel
from .report_data_view import ReportDataViews
import traceback
from datetime import datetime
from dateutil.relativedelta import relativedelta

class AllProductView(APIView):
    
    @staticmethod
    def get_data(project_pk: int, product: dict, scenario_pk: int = None):
        # Limpiar los valores de texto en el diccionario 'product'
        cleaned_product = {key: value.strip() if isinstance(value, str) else value for key, value in product.items()}

        # Construir la parte de la consulta WHERE de forma dinámica
        conditions = " AND ".join([f"{key} = '{value}'" if isinstance(value, str) else f"{key} = {value}" for key, value in cleaned_product.items()])

        if scenario_pk is False or scenario_pk is None:
            table = FileRefModel.objects.filter(project_id=project_pk, model_type_id=1).first()
            query = f"SELECT * FROM {table.file_name} WHERE {conditions};"
        
        else:
            adjusted_conditions = " AND ".join([
                f"{key} = 0" if (isinstance(value, str) and value == '') else f"{key} = '{value}'" if isinstance(value, str) else f"{key} = {value}"
                for key, value in cleaned_product.items()
            ])
            table = ForecastScenario.objects.get(pk=scenario_pk)
            
            query = f'''
                WITH FilteredTable AS (
                    SELECT * FROM {table.predictions_table_name} 
                        WHERE Model = 'actual' OR Best_Model = 1
                )
                SELECT * FROM FilteredTable WHERE {adjusted_conditions};
                
            '''
        
        data = pd.read_sql_query(query, engine)

        return data
    
    @staticmethod
    def calculate_kpis(predictions_table_name, last_date_index, list_date_columns, product, last_date):
        try:
            with (connection.cursor() as cursor):
                if len(list_date_columns) > 12: 
                    actual_year_predicted = list(filter(lambda x: x.startswith(last_date.split('-')[0]), list_date_columns))
                    actual_year_historical = actual_year_predicted[:actual_year_predicted.index(last_date) + 1]

                    previous_year_dates = [(datetime.strptime(date, '%Y-%m-%d') - relativedelta(years=1)).strftime('%Y-%m-%d') for date in actual_year_historical]
                    previous_year_dates = list(filter(lambda x: x in previous_year_dates, previous_year_dates))
                    previous_year_predicted = [(datetime.strptime(date, '%Y-%m-%d') - relativedelta(years=1)).strftime('%Y-%m-%d') for date in actual_year_predicted]

                last_year_since_last_date = list_date_columns[last_date_index - 12:last_date_index + 1][1:]
                last_quarter_since_last_date = list_date_columns[last_date_index - 3:last_date_index + 1]
                last_month = list_date_columns[last_date_index]

                next_year_since_last_date = list_date_columns[last_date_index + 1:last_date_index + 13]
                next_quarter_since_last_date = list_date_columns[last_date_index + 1:last_date_index + 5]
                next_month_since_last_date = list_date_columns[last_date_index + 1:last_date_index + 2]

                if last_date_index - 23 >= 0:
                    dates_a = list_date_columns[last_date_index - 23:last_date_index - 11]
                else:
                    dates_a = list_date_columns[:last_date_index - 11]
                    
                dates_b = dates_a[-4:]
                dates_c = dates_a[-1]

                dates_d = last_year_since_last_date[:4]
                dates_e = dates_d[0]

                reports_name = [
                    "last_year_since_last_date",
                    "last_quarter_since_last_date",
                    "last_month",
                    "next_year_since_last_date",
                    "next_quarter_since_last_date",
                    "next_month_since_last_date",
                    "dates_a",
                    "dates_b",
                    "dates_c",
                    "dates_d",
                    "dates_e",
                    "actual_year" if len(list_date_columns) > 12 else None,
                    "last_year" if len(list_date_columns) > 12 else None,
                    "full_actual_year" if len(list_date_columns) > 12 else None,
                    "full_past_year" if len(list_date_columns) > 12 else None,
                ]

                date_ranges = [
                    last_year_since_last_date,
                    last_quarter_since_last_date,
                    last_month,
                    next_year_since_last_date,
                    next_quarter_since_last_date,
                    next_month_since_last_date,
                    dates_a,
                    dates_b,
                    dates_c,
                    dates_d,
                    dates_e,
                    actual_year_historical if len(list_date_columns) > 12 else None,
                    previous_year_dates if len(list_date_columns) > 12 else None,
                    actual_year_predicted if len(list_date_columns) > 12 else None,
                    previous_year_predicted if len(list_date_columns) > 12 else None,
                ]
                
                reports_data = {}

                for date_range, date_name in zip(date_ranges, reports_name):
                    dates_report = ReportDataViews.join_dates(list_dates=date_range, for_report=True)
                    reports_data[date_name] = dates_report
                
                actual_dates = f'''
                    SELECT
                        SKU || " " || DESCRIPTION,
                        ROUND({reports_data["last_year_since_last_date"]}),
                        ROUND({reports_data["last_quarter_since_last_date"]}),
                        ROUND(SUM(`{last_month}`)),
                        ROUND({reports_data["dates_a"]}),
                        ROUND({reports_data["dates_b"]}),
                        ROUND(SUM(`{dates_c}`)),
                        ROUND({reports_data["dates_d"]}),
                        ROUND(SUM(`{dates_e}`)),
                        ROUND({reports_data["actual_year"]}),
                        ROUND({reports_data["last_year"]})
                    FROM {predictions_table_name}
                    WHERE model = 'actual' AND SKU = "{product}"
                    GROUP BY SKU, DESCRIPTION;
                '''

                predicted_dates = f'''
                    SELECT
                        SKU || " " || DESCRIPTION,
                        ROUND({reports_data["next_year_since_last_date"]}),
                        ROUND({reports_data["next_quarter_since_last_date"]}),
                        ROUND({reports_data["next_month_since_last_date"]}),
                        ROUND({reports_data["full_actual_year"]}),
                        ROUND({reports_data["full_past_year"]})
                    FROM {predictions_table_name}
                    WHERE model != 'actual' AND SKU = "{product}" AND best_model = 1
                    GROUP BY SKU, DESCRIPTION;
                '''

                cursor.execute(sql=actual_dates)
                actual_dates = cursor.fetchall()

                cursor.execute(sql=predicted_dates)
                predicted_dates = cursor.fetchall()
            
                final_data = []

                for predicted, actual in zip(predicted_dates, actual_dates):
                    # Verificar si las categorías coinciden
                    if predicted[0] == actual[0]:
                        # Calcular los porcentajes
                        ytd = ReportDataViews.calc_perc(n1=actual[1], n2=actual[4])
                        qtd = ReportDataViews.calc_perc(n1=actual[2], n2=actual[5])
                        mtd = ReportDataViews.calc_perc(n1=actual[3], n2=actual[6])
                        fytd = ReportDataViews.calc_perc(n1=actual[9], n2=actual[10])
                        ytg = ReportDataViews.calc_perc(n1=predicted[1], n2=actual[1])
                        qtg = ReportDataViews.calc_perc(n1=predicted[2], n2=actual[7])
                        mtg = ReportDataViews.calc_perc(n1=predicted[3], n2=actual[8])
                        fytg = ReportDataViews.calc_perc(n1=predicted[4], n2=predicted[5])
                        
                        # Agregar los resultados a la lista final
                        final_data.append([ytd, qtd, mtd, fytd, ytg, qtg, mtg, fytg])

                # Retornar los datos finales
                return final_data
            
        except Exception as err:
            traceback.print_exc()
            print(err)


    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        scenario = request.data.get('scenario_pk')
        product = request.data.get('product')  # Asegúrate de que 'product' es un diccionario con los campos correctos
        project = request.data.get('project_pk')
        
        data = self.get_data(project_pk=project, product=product, scenario_pk=scenario)

        if scenario is None or scenario is False:
            date_columns = [col for col in data.columns if '-' in col and len(col.split('-')) == 3]
            values = data[date_columns].values.tolist()
            final_data = {
                "product": f"{product['SKU']}",
                "graphic_forecast": {"dates": date_columns, "values": []},
                "graphic_historical": {"dates": date_columns, "values": values[0]},
                "error": "",
                "kpis": {"columns": [], "values": []},
            } 

            return Response(final_data, status=status.HTTP_200_OK)
        
        else:
            scenario_obj = ForecastScenario.objects.get(pk=scenario)
            error_val = data[scenario_obj.error_type]
            max_date = scenario_obj.max_historical_date
            date_columns = [col for col in data.columns if '-' in col and len(col.split('-')) == 3]
            index = date_columns.index(str(max_date))
            values = data[date_columns].values.tolist()
            
            # Intentar calcular los KPIs, manejar la excepción si ocurre un error
            try:
                kpis = self.calculate_kpis(
                    predictions_table_name=scenario_obj.predictions_table_name, 
                    last_date_index=index, 
                    list_date_columns=date_columns, 
                    product=product["SKU"], 
                    last_date=max_date.strftime('%Y-%m-%d')
                )
            except Exception as e:
                print(f"Error al calcular KPIs: {e}")  # Puedes registrar el error para su seguimiento
                kpis = []  # Asignar una lista vacía si ocurre un error
            
            final_data = {
                "product": f"{product['SKU']}",
                "graphic_forecast": {"dates": date_columns, "values": values[1]},
                "graphic_historical": {"dates": date_columns, "values": values[0]},
                "error": str(max(error_val)),
                "kpis": {"columns": ["YTD", "QTD", "MTD", "FYTD", "YTG", "QTG", "MTG", "FYTG"], "values": kpis if kpis else []},
            }

            return Response(final_data, status=status.HTTP_200_OK)

