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
    # This function
    @staticmethod
    def filter_dates_by_month(date_list, target_month):
        # Get the current date and time
        current_date = datetime.now()
        filtered_dates = []  # List for dates matching the criteria (month and before the current date)
        future_dates = []  # List for dates after the current date

        for date_str in date_list:
            # Try to parse the date string in two formats (with and without time)
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                date = datetime.strptime(date_str, "%Y-%m-%d")

            if date.month == target_month:  # Check if the date's month matches the target month
                if date < current_date:  # If the date is before the current date
                    filtered_dates.append(date_str)  # Add it to the filtered dates list
                else:
                    future_dates.append(date_str)  # If the date is in the future, add it to the future dates list

        return filtered_dates, future_dates

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        filters = FilterData(data=request.data)

        if filters.is_valid():
            scenario_id = filters.validated_data['scenario_id']
            filter_name = filters.validated_data['filter_name']
            filter_value = filters.validated_data['filter_value']
            scenario = ForecastScenario.objects.filter(pk=scenario_id).first()
            table_name = scenario.predictions_table_name

            with connection.cursor() as cursor:
                month = filter_value.split('-')[1]
                year = filter_value.split('-')[0]
                cursor.execute(sql=f'SELECT name FROM pragma_table_info("{table_name}") WHERE name LIKE "%-%";')
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
                past_dates, future_dates = self.filter_dates_by_month(date_list=list_date_columns,
                                                                      target_month=int(month))

                past_cols = ",\n".join([f"SUM(\"{date}\") as \"{date.split('-')[0]}\"" for date in past_dates])
                future_cols = ",\n".join([f"SUM(\"{date}\") as \"{date.split('-')[0]}\"" for date in future_dates])

                query_for_past_dates = f'''
                    SELECT {filter_name},
                        {past_cols}
                    FROM {table_name}
                    WHERE model = 'actual'
                    GROUP BY {filter_name};
                '''

                query_for_future_dates = f'''
                    SELECT {filter_name},
                        {future_cols}
                    FROM {table_name}
                    WHERE model != 'actual'
                    GROUP BY {filter_name};
                '''

                cursor.execute(sql=query_for_past_dates)
                past_data = cursor.fetchall()

                cursor.execute(sql=query_for_future_dates)
                future_data = cursor.fetchall()

                # Combine past_data and future_data based on the filter_name
                combined_data = {}

                for row in past_data:
                    filter_name = row[0]  # Assuming the filter_name is in the first column
                    combined_data.setdefault(filter_name, []).extend(row[1:])

                for row in future_data:
                    filter_name = row[0]  # Assuming the filter_name is in the first column
                    combined_data.setdefault(filter_name, []).extend(row[1:])

                # Convert the combined data into a list of lists
                data = [[filter_name] + values for filter_name, values in combined_data.items()]
                rounded_data = [[item if i == 0 else round(item, 2) for i, item in enumerate(row)] for row in data]

                json_data = {'years': years, 'data': rounded_data}

                return Response(json_data, status=status.HTTP_200_OK)

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
