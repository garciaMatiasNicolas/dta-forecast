from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from ..serializer import FilterData
from projects.models import ProjectsModel
from ..models import ForecastScenario
from django.db import connection
from datetime import datetime


class ReportDataViews(APIView):

    @staticmethod
    def join_dates(list_dates: list, for_report: bool):
        if for_report:
            dates_joined = " + ".join([f"SUM(\"{date}\")" for date in list_dates])
        else:
            dates_joined = ",\n".join([f"SUM(\"{date}\") as \"{date.split('-')[0]}\"" for date in list_dates])

        return dates_joined

    @staticmethod
    def filter_dates_by_month(last_date, date_list, target_month):
        try:
            last_date = datetime.strptime(last_date, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            last_date = datetime.strptime(last_date, "%Y-%m-%d")

        filtered_dates = []  # List for dates matching the criteria (month and before the current date)
        future_dates = []  # List for dates after the current date

        for date_str in date_list:
            # Try to parse the date string in two formats (with and without time)
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                date = datetime.strptime(date_str, "%Y-%m-%d")

            if date.month == target_month:  # Check if the date's month matches the target month
                if date < last_date:  # If the date is before the current date
                    filtered_dates.append(date_str)  # Add it to the filtered dates list
                else:
                    future_dates.append(date_str)  # If the date is in the future, add it to the future dates list

        return filtered_dates, future_dates

    def handle_reports(self, filter_name, predictions_table_name, last_date_index, list_date_columns, product=None):
        with (connection.cursor() as cursor):
            last_twelve_months_since_last = list_date_columns[last_date_index - 12:last_date_index]
            last_three_months_since_last = list_date_columns[last_date_index - 12:last_date_index][:3]
            last_month_since_last = list_date_columns[last_date_index - 12:last_date_index]

            next_twelve_months_since_last = list_date_columns[last_date_index:last_date_index + 12]
            next_three_months_since_last = list_date_columns[last_date_index:last_date_index + 3]
            next_month_since_last = list_date_columns[last_date_index:last_date_index + 1]

            dates_a = list_date_columns[last_date_index - 24:last_date_index][:12]
            dates_b = list_date_columns[last_date_index - 24:last_date_index][:3]
            dates_c = list_date_columns[last_date_index - 24:last_date_index][0]

            reports_name = [
                "last_twelve_months_since_last",
                "last_three_months_since_last",
                "next_twelve_months_since_last",
                "next_three_months_since_last",
                "next_month_since_last",
                "dates_a",
                "dates_b"
            ]

            date_ranges = [
                last_twelve_months_since_last,
                last_three_months_since_last,
                next_twelve_months_since_last,
                next_three_months_since_last,
                next_month_since_last,
                dates_a,
                dates_b
            ]

            reports_data = {}

            for date_range, date_name in zip(date_ranges, reports_name):
                dates_report = self.join_dates(list_dates=date_range, for_report=True)
                reports_data[date_name] = dates_report

            # QUERY FOR HISTORICAL DATA REPORTS #

            query_a = f'''
                SELECT
                    {filter_name},
                    ROUND((diff / valor_antiguo) * 100, 2) AS porcentaje_cambio
                FROM(
                    SELECT
                        {filter_name},
                        ROUND({reports_data["last_twelve_months_since_last"]}) - 
                        ROUND({reports_data["dates_a"]}) AS diff,
                        ROUND({reports_data["dates_a"]}) AS valor_antiguo
                    FROM {predictions_table_name}
                    {'WHERE SKU = ' + f"'{str(product)}'" if product else ''} 
                    GROUP BY {filter_name}
                ) AS t;
            '''

            query_b = f'''
                SELECT
                    {filter_name},
                    ROUND((diff / valor_antiguo) * 100, 2) AS porcentaje_cambio
                FROM(
                    SELECT
                        {filter_name},
                        ROUND({reports_data["last_three_months_since_last"]}) - 
                        ROUND({reports_data["dates_b"]}) AS diff,
                        ROUND({reports_data["dates_b"]}) AS valor_antiguo
                    FROM {predictions_table_name} 
                    {'WHERE SKU = ' + f"'{str(product)}'" if product else ''} 
                    GROUP BY {filter_name}
                ) AS t;
            '''

            query_c = f'''
                SELECT
                    {filter_name},
                    ROUND((diff / valor_antiguo) * 100, 2) AS porcentaje_cambio
                FROM(
                    SELECT
                        {filter_name},
                        ROUND(SUM("{last_month_since_last[0]}")) - 
                        ROUND(SUM("{dates_c}")) AS diff,
                        ROUND(SUM("{dates_c}")) AS valor_antiguo
                    FROM {predictions_table_name} 
                    {'WHERE SKU = ' + f"'{str(product)}'" if product else ''} 
                    GROUP BY {filter_name}
                ) AS t;
            '''

            # QUERY FOR PREDICTED DATA REPORTS #

            next_year_over_last_year = f'''
                SELECT
                    {filter_name},
                    ROUND((diff / valor_antiguo) * 100, 2) AS porcentaje_cambio
                FROM(
                    SELECT
                        {filter_name},
                        ROUND({reports_data["next_twelve_months_since_last"]}) - 
                        ROUND({reports_data["last_twelve_months_since_last"]}) AS diff,
                        ROUND({reports_data["last_twelve_months_since_last"]}) AS valor_antiguo
                    FROM {predictions_table_name} 
                    {'WHERE SKU = ' + f"'{str(product)}'" if product else ''} 
                    GROUP BY {filter_name}
                ) AS t;
            '''

            next_three_months_over_last = f'''
                SELECT
                    {filter_name},
                    ROUND((diff / valor_antiguo) * 100, 2) AS porcentaje_cambio
                FROM(
                    SELECT
                        {filter_name},
                        ROUND({reports_data["next_three_months_since_last"]}) - 
                        ROUND({reports_data["last_three_months_since_last"]}) AS diff,
                        ROUND({reports_data["last_three_months_since_last"]}) AS valor_antiguo
                    FROM {predictions_table_name} 
                    {'WHERE SKU = ' + f"'{str(product)}'" if product else ''} 
                    GROUP BY {filter_name}
                ) AS t;
            '''

            next_month_over_last = f'''
                SELECT
                    {filter_name},
                    ROUND((diff / valor_antiguo) * 100, 2) AS porcentaje_cambio
                FROM(
                    SELECT
                        {filter_name},
                        ROUND({reports_data["next_month_since_last"]}) - 
                        ROUND(SUM("{last_month_since_last[0]}")) AS diff,
                        ROUND(SUM("{last_month_since_last[0]}")) AS valor_antiguo
                    FROM {predictions_table_name} 
                    {'WHERE SKU = ' + f"'{str(product)}'" if product else ''} 
                    GROUP BY {filter_name}
                ) AS t;
            '''

            cursor.execute(sql=query_a)
            report_a = cursor.fetchall()

            cursor.execute(sql=query_b)
            report_b = cursor.fetchall()

            cursor.execute(sql=query_c)
            report_c = cursor.fetchall()

            cursor.execute(sql=next_year_over_last_year)
            report_d = cursor.fetchall()

            cursor.execute(sql=next_three_months_over_last)
            report_e = cursor.fetchall()

            cursor.execute(sql=next_month_over_last)
            report_f = cursor.fetchall()

            report_a_list = [list(row) for row in report_a]
            report_b_list = [list(row) for row in report_b]
            report_c_list = [list(row) for row in report_c]
            report_d_list = [list(row) for row in report_d]
            report_e_list = [list(row) for row in report_e]
            report_f_list = [list(row) for row in report_f]

            all_reports_list = report_a_list + report_b_list + report_c_list + report_d_list + report_e_list + report_f_list

            grouped_data = {}
            for col_name, value in all_reports_list:
                if col_name not in grouped_data:
                    grouped_data[col_name] = []
                grouped_data[col_name].append(value)

            final_data = [[col_name] + values for col_name, values in grouped_data.items()]

            return final_data

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
            project_pk = filters.validated_data['project_id']
            project = ProjectsModel.objects.filter(pk=project_pk).first()
            predictions_table_name = scenario.predictions_table_name
            historical_data_table_name = f'Historical_data_{project.project_name}_user{scenario.user.id}'

            with connection.cursor() as cursor:
                cursor.execute(sql=f'''SELECT MAX(name) FROM pragma_table_info("{historical_data_table_name}") 
                                WHERE name LIKE "%-%";''')
                last_date = cursor.fetchall()

                cursor.execute(sql=f'''SELECT name FROM pragma_table_info("{predictions_table_name}") 
                                WHERE name LIKE "%-%";''')
                date_columns = cursor.fetchall()

                """
                SQL QUERY FOR MYSQL
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = NOMBRE_TABLA
                    AND COLUMN_NAME LIKE '%-%';
                """

                # Get the years distinct and get a transform into a list the sqlquery tuple list
                years_set = set()
                list_date_columns = []

                for date in date_columns:
                    date_str = date[0]
                    list_date_columns.append(date_str)
                    year = date_str.split('-')[0]
                    years_set.add(year)

                years = sorted(list(years_set))

                last_date_str = datetime.strptime(last_date[0][0], '%Y-%m-%d %H:%M:%S')
                new_last_date = last_date_str.strftime('%Y-%m-%d')
                last_date_index = list_date_columns.index(new_last_date)

                # Handle reports and get data
                final_data = self.handle_reports(filter_name, predictions_table_name,
                                                 last_date_index, list_date_columns, product)

                past_dates, future_dates = self.filter_dates_by_month(last_date=last_date[0][0],
                                                                      date_list=list_date_columns,
                                                                      target_month=int(month))

                past_cols = self.join_dates(list_dates=past_dates, for_report=False)
                future_cols = self.join_dates(list_dates=future_dates, for_report=False)

                query_for_past_dates = f'''
                    SELECT {'SKU || " " ||DESCRIPTION' if filter_name == "sku" else filter_name},
                        {past_cols}
                    FROM {predictions_table_name}
                    WHERE model = 'actual'
                    {'AND SKU = ' + f"'{str(product)}'" if product else ''}
                    GROUP BY {filter_name};
                '''
                print(query_for_past_dates)
                query_for_future_dates = f'''
                    SELECT {'SKU || " " ||DESCRIPTION' if filter_name == "sku" else filter_name},
                        {future_cols}
                    FROM {predictions_table_name}
                    WHERE model != 'actual'
                    {'AND SKU = ' + f"'{str(product)}'" if product else ''}
                    GROUP BY {filter_name};
                '''

                # Combine past_data and future_data based on the filter_name
                combined_data = {}

                cursor.execute(sql=query_for_past_dates)
                past_data = cursor.fetchall()

                cursor.execute(sql=query_for_future_dates)
                future_data = cursor.fetchall()

                dict_values = {tupla[0]: tupla[1] for tupla in future_data}

                rounded_data = [[elem[0]] + [round(val, 2) for val in elem[1:]] +
                                [round(dict_values[elem[0]], 2)] for elem in past_data]

                json_data = dict(columns=years, data=rounded_data)

                return Response({"data_per_month": json_data, "reports": final_data},
                                status=status.HTTP_200_OK)

        else:
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
                cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
                rows = cursor.fetchall()
                total = rows[0][0] / 2

                cursor.execute(f'''
                    SELECT  
                    MODEL, 
                    COUNT(*) 
                    FROM {table_name}
                    WHERE MODEL != 'actual' GROUP BY MODEL;''')

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
