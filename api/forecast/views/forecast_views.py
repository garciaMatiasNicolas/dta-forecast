from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from files.filemanager import save_dataframe
from rest_framework.response import Response
from projects.models import ProjectsModel
from ..serializer import GetScenarioById
from rest_framework.views import APIView
from ..models import ForecastScenario
from rest_framework import status
from django.conf import settings
from files.file_model import FileRefModel
from database.db_engine import engine
from ..Graphic import Graphic
from ..Error import Error
from ..Forecast import Forecast
import pandas as pd
import os
import threading
import numpy as np
import traceback
from sqlalchemy.exc import NoSuchTableError
from django.db import connection


class RunModelsViews(APIView):
    @staticmethod
    def get_historical_data(table_name: str):
        try:
            dataframe = pd.read_sql_table(table_name, con=engine)

            dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].replace(to_replace=["NaN", "null", "nan"], value=np.nan)
            dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].fillna(0).apply(pd.to_numeric, errors='coerce').values

            columns = dataframe.columns[13:]

            dataframe.iloc[:, 13:] = dataframe.iloc[:, 13:].fillna(0)

            return dataframe

        except NoSuchTableError as e:
            return None
    
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        # Check if the request method is POST
        if request.method == "POST":
            # Get scenario id from request body
            data = GetScenarioById(data=request.data)

            # Check if the data is valid
            if not data.is_valid():
                return Response({'error': 'bad_request', 'logs': data.errors},
                                status=status.HTTP_400_BAD_REQUEST)

            scenario_id = data.validated_data.get("scenario_id")
            additional_params = request.data.get('additional_params')
            detect_outliers = request.data.get("detect_outliers")
            explosive_variable = request.data.get("explosive_variable")

            try:
                # Search for the scenario by ID
                scenario = ForecastScenario.objects.filter(pk=scenario_id).first()

                # If scenario does not exist, return a not found error
                if not scenario:
                    return Response({'error': 'scenario_not_found'}, status=status.HTTP_404_NOT_FOUND)

                # Get the project related to the scenario
                project = ProjectsModel.objects.filter(pk=scenario.project.id).first()

                # If project does not exist, return a not found error
                if not project:
                    return Response({'error': 'project_not_found'}, status=status.HTTP_404_NOT_FOUND)

                # Validate models
                models = scenario.models
                user = scenario.user.id

                if 'arimax' in models or 'sarimax' in models or 'prophet_exog' in models:

                    exog = FileRefModel.objects.filter(project_id=scenario.project_id, model_type_id=2).first()
                    exog_projected = FileRefModel.objects.filter(project_id=scenario.project_id, model_type_id=3).first()

                    if exog is None:
                        return Response(data={'error': 'not_exog_data'}, status=status.HTTP_400_BAD_REQUEST)

                    df_exog_data = self.get_historical_data(table_name=exog.file_name)
                    max_date_exog = df_exog_data.columns[-1]

                    if exog_projected is not None:
                        df_exog_data_projected = self.get_historical_data(table_name=exog_projected.file_name) 
                        
                        df_exog_data = pd.merge(df_exog_data, df_exog_data_projected, 
                            on=['Variable', 'Family', 'Region', 'Salesman', 'Client', 
                                'Category', 'Subcategory', 'SKU', 'Description'], how='outer')
                        
                        df_exog_data.iloc[:, 9:] = df_exog_data.iloc[:, 9:].fillna(0)


                # Extract required scenario data
                test_p = scenario.test_p
                pred_p = scenario.pred_p
                error_method = scenario.error_type
                error_periods = scenario.error_p
                scenario_name = scenario.scenario_name
                table_name = f'historical_data_{project.project_name}_user{user}'
                query = f"SELECT * FROM {table_name}"
                df = pd.read_sql_query(query, con=engine)

                max_historical_data_date = pd.to_datetime(df.columns[-1])
                scenario.max_historical_date = max_historical_data_date

                # Get historical data for the scenario
                df_historical = self.get_historical_data(table_name=table_name)
                seasonal_periods = df_historical['Periods Per Cycle'][0]
                scenario.seasonal_periods = seasonal_periods

                # Excel predictions path
                path = f'media/excel_files/predictions/{project.project_name}_scenario_{scenario_name}_u{user}.xlsx'

                # Excel all models path
                path_all_models = f'{path}_all.xlsx'

                if 'arimax' in models or 'sarimax' in models or 'prophet_exog' in models:
                    forecast = Forecast(df=df_historical, prediction_periods=pred_p, error_periods=error_periods,
                                        test_periods=test_p, error_method=error_method, seasonal_periods=seasonal_periods, models=models,
                                        additional_params=additional_params, detect_outliers=detect_outliers, explosive_variable=explosive_variable, df_exog=df_exog_data, max_date=max_date_exog)
                
                else:
                    forecast = Forecast(df=df_historical, prediction_periods=pred_p, error_periods=error_periods,
                                        test_periods=test_p, error_method=error_method, seasonal_periods=seasonal_periods, models=models,
                                        additional_params=additional_params, detect_outliers=detect_outliers, explosive_variable=explosive_variable)

                all_predictions = forecast.run_forecast()
                all_predictions.sort_values(by="SKU")
                # all_predictions.to_excel(path_all_models, index=False)

                best_scenario = Forecast.select_best_model(df=all_predictions, error_method=error_method, models=models)
                best_scenario = best_scenario[(best_scenario['model'] == 'actual') | (best_scenario['best_model'] == 1)]
                best_scenario.sort_values(by="SKU")
                best_scenario.to_excel(path, index=False)

                error_avg = best_scenario[best_scenario['model'] != 'actual'][error_method].mean()
                last_error = best_scenario[best_scenario['model'] != 'actual']["LAST ERROR"].mean()

                file_path = os.path.join(settings.MEDIA_ROOT, 'excel_files/predictions',
                                         f'{project.project_name}_scenario_{scenario_name}_u{user}.xlsx')


                # Save the predictions in the scenario
                scenario.predictions_table_name = f'{project.project_name}_scenario_{scenario_name}_u{user}'
                scenario.error_last_twelve_periods = round(error_avg, 1)
                scenario.url_predictions = path
                scenario.additional_params = additional_params
                scenario.error_last_period = round(last_error, 1)
                # scenario.error_abs = error.calculate_error_last_period(prediction_periods=pred_p, df=best_scenario)
                scenario.save()

                # Save the predicted data as a table
                save_dataframe(route_file="",
                               file_name=f'{project.project_name}_scenario_{scenario_name}_u{user}',
                               model_type="historical_data",
                               wasSaved=True,
                               project_pk=project,
                               df=all_predictions)

                return Response({'message': 'succeed'}, status=status.HTTP_200_OK)

            except ForecastScenario.DoesNotExist:
                # Return not found error if the scenario does not exist
                return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

            except Exception as e:
                # Return a general bad request error for other exceptions
                traceback.print_exc()
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GraphicDataView(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request):
        sc_id = request.GET.get('scenario')

        try:
            scenario = ForecastScenario.objects.get(pk=sc_id)
        except:
            return Response(data={"error": "scenario_not_found"}, status=status.HTTP_400_BAD_REQUEST)
        
        table = pd.read_sql_table(scenario.predictions_table_name, con=engine)

        graph = Graphic(
            max_date=scenario.max_historical_date,
            pred_p=scenario.pred_p,
            dataframe=table,
            error_method=scenario.error_type
        )
        data, data_year = graph.graphic_predictions()

        return Response(data={"final_data_pred": data, "data_year_pred": data_year}, status=status.HTTP_200_OK)
    