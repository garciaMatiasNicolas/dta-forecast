from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ..serializer import FilterData
from ..models import ForecastScenario
from django.db import connection
from datetime import datetime
from dateutil.relativedelta import relativedelta
import traceback



class ReportDataViews(APIView):

    @staticmethod
    def calc_perc(n1: float, n2: float) -> float:
        try:
            result = round((n1 / n2 - 1) * 100)
            return result
        except ZeroDivisionError:
            return 0

    @staticmethod
    def join_dates(list_dates: list, for_report: bool):
        if for_report:
            dates_joined = " + ".join([f"SUM(`{date}`)" for date in list_dates])
        else:
            dates_joined = ",\n".join([f"ROUND(SUM(`{date}`)) as `{date.split('-')[0]}`" for date in list_dates])

        return dates_joined


    @staticmethod
    def filter_dates_by_month(last_date, date_list, target_month):
        filtered_dates = []  # List for dates matching the criteria (month and before the current date)
        future_dates = []  # List for dates after the current date

        # Convert last_date to a datetime object (assuming last_date is a date object)
        last_date = datetime.combine(last_date, datetime.min.time())

        for date_str in date_list:
            # Try to parse the date string in two formats (with and without time)
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                date = datetime.strptime(date_str, "%Y-%m-%d")

            if date.month == target_month:  # Check if the date's month matches the target month
                if date < last_date:  # If the date is before the last_date (converted to datetime)
                    filtered_dates.append(date_str)  # Add it to the filtered dates list
                else:
                    future_dates.append(date_str)  # If the date is in the future, add it to the future dates list

        return filtered_dates, future_dates

    def handle_reports(self, filter_name, predictions_table_name, last_date_index, list_date_columns, last_date, product=None):
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
                    dates_report = self.join_dates(list_dates=date_range, for_report=True)
                    reports_data[date_name] = dates_report
                
                actual_dates = f'''
                    SELECT
                        {filter_name},
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
                    WHERE model = 'actual'
                    GROUP BY {filter_name} WITH ROLLUP;

                    SELECT 'TOTAL',
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
                    WHERE model = 'actual'
                    ;

                '''

                predicted_dates = f'''
                    SELECT
                        {filter_name},
                        ROUND({reports_data["next_year_since_last_date"]}),
                        ROUND({reports_data["next_quarter_since_last_date"]}),
                        ROUND({reports_data["next_month_since_last_date"]}),
                        ROUND({reports_data["full_actual_year"]}),
                        ROUND({reports_data["full_past_year"]})
                    FROM {predictions_table_name}
                    WHERE model != 'actual' AND best_model = 1
                    GROUP BY {filter_name} WITH ROLLUP;

                    SELECT 'TOTAL',
                        ROUND({reports_data["next_year_since_last_date"]}),
                        ROUND({reports_data["next_quarter_since_last_date"]}),
                        ROUND({reports_data["next_month_since_last_date"]}),
                        ROUND({reports_data["full_actual_year"]}),
                        ROUND({reports_data["full_past_year"]})
                    FROM {predictions_table_name}
                    WHERE model = "actual" AND best_model = 1;
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
                        ytd = self.calc_perc(n1=actual[1], n2=actual[4])
                        qtd = self.calc_perc(n1=actual[2], n2=actual[5])
                        mtd = self.calc_perc(n1=actual[3], n2=actual[6])
                        fytd = self.calc_perc(n1=actual[9], n2=actual[10])
                        ytg = self.calc_perc(n1=predicted[1], n2=actual[1])
                        qtg = self.calc_perc(n1=predicted[2], n2=actual[7])
                        mtg = self.calc_perc(n1=predicted[3], n2=actual[8])
                        fytg = self.calc_perc(n1=predicted[4], n2=predicted[5])
                        
                        # Agregar los resultados a la lista final
                        final_data.append([predicted[0], ytd, qtd, mtd, fytd, ytg, qtg, mtg, fytg])

                # Retornar los datos finales

                return final_data
            
        except Exception as err:
            traceback.print_exc()
            print(err)

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)
        product = request.data.get('product')

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            filter_name = filters.validated_data['filter_name']
            month = filters.validated_data['filter_value']
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            predictions_table_name = scenario.predictions_table_name

            with connection.cursor() as cursor:
                last_date = scenario.max_historical_date

                cursor.execute(sql=f'''
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'dtafio' AND TABLE_NAME = '{predictions_table_name}' AND COLUMN_NAME LIKE '%-%';
                ''')
                date_columns = cursor.fetchall()

                # Get the years distinct and get a transform into a list the sqlquery tuple list
                years_set = set()
                list_date_columns = []

                for date in date_columns:
                    date_str = date[0]
                    list_date_columns.append(date_str)
                    year = date_str.split('-')[0]
                    years_set.add(year)

                years = sorted(list(years_set))

                new_last_date = last_date.strftime('%Y-%m-%d')
                last_year = new_last_date.split('-')[0]
                last_date_index = list_date_columns.index(new_last_date)

                # Handle reports and get data
                final_data = self.handle_reports(filter_name, predictions_table_name,
                                                last_date_index, list_date_columns, new_last_date, product)

                past_dates, future_dates = self.filter_dates_by_month(last_date=last_date,
                                                                    date_list=list_date_columns,
                                                                    target_month=int(month))

                past_cols = self.join_dates(list_dates=past_dates, for_report=False)
                future_cols = self.join_dates(list_dates=future_dates, for_report=False)
                data = {}
                

                query_for_past_dates = f'''
                    SELECT {filter_name},
                        {past_cols}
                    FROM {predictions_table_name}
                    WHERE model = 'actual'
                    {'AND SKU = ' + f"'{str(product)}'" if product else ''}
                    GROUP BY {filter_name};
                '''

                def get_dates():
                    past = ",\n".join([f'a.`{date.split("-")[0]}`' for date in past_dates])
                    future = ",\n".join([f'b.`{date.split("-")[0]}`' for date in future_dates])
                    return past, future

                if len(future_dates) > 0:
                    past, future = get_dates()

                    query_for_all_dates = f'''
                        SELECT  
                            a.{filter_name},
                            {past},
                            {future}
                        FROM (
                            SELECT {filter_name},
                                {past_cols}
                                FROM {predictions_table_name}
                                WHERE model = 'actual'
                                {'AND SKU = ' + f"'{str(product)}'" if product else ''}
                            GROUP BY {filter_name}
                        ) a
                        JOIN 
                        (
                            SELECT {filter_name},
                            {future_cols}
                                FROM {predictions_table_name}
                                WHERE model = "actual" OR best_model = 1
                                {'AND SKU = ' + f"'{str(product)}'" if product else ''}
                            GROUP BY {filter_name}
                        ) b ON a.{filter_name} = b.{filter_name};
                    '''

                    cursor.execute(sql=query_for_all_dates)
                    all_dates_raw = cursor.fetchall()
                    column_names = [desc[0] for desc in cursor.description]
                    ordered_column_names = sorted(column_names, reverse=False, key=lambda x: x if x != filter_name else '')
    
                    # Construir los diccionarios con el orden de columnas deseado
                    data = [dict((col, row[column_names.index(col)]) for col in ordered_column_names) for row in all_dates_raw]

                else:
                    cursor.execute(sql=query_for_past_dates)
                    past_data = cursor.fetchall()

                    # Reordenar las columnas de manera explícita
                    ordered_column_names = sorted(column_names, reverse=False, key=lambda x: x if x != filter_name else '')
                    
                    # Construir los diccionarios con el orden de columnas deseado
                    data = [dict((col, row[column_names.index(col)]) for col in ordered_column_names) for row in past_data]

                return Response(data={"data_per_month": data, "reports": final_data},
                                status=status.HTTP_200_OK)

        else:
            print(filters.errors)
            return Response({'error': 'bad_request', 'logs': filters.errors},
                            status=status.HTTP_400_BAD_REQUEST)


class ModelsGraphicAPIView(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        scenario_pk = request.data.get('scenario_id')
        scenario = ForecastScenario.objects.get(id=scenario_pk)

        if scenario:
            table_name = scenario.predictions_table_name

            with connection.cursor() as cursor:
                query = f'SELECT COUNT(*) FROM {table_name} WHERE Model = "actual" OR Best_Model = 1'
                cursor.execute(query)
                rows = cursor.fetchall()
                total = rows[0][0] / 2

                query = f'''
                    SELECT  
                    MODEL, 
                    COUNT(*) 
                    FROM {table_name}
                    WHERE (MODEL != 'actual')
                    AND (Model = 'actual' OR Best_Model = 1)
                    GROUP BY MODEL;'''
                
                cursor.execute(query)
                data_rows = cursor.fetchall()

                models = []
                avg = []

                for row in data_rows:
                    model, number_model = row[0], row[1]
                    percentage = round((number_model / total) * 100, 2)
                    models.append(model)
                    avg.append(percentage)

            return Response({'models': models, 'avg': avg}, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'scenario_not_found'}, status=status.HTTP_400_BAD_REQUEST)
