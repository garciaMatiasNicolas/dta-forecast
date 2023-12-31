from rest_framework.decorators import authentication_classes, permission_classes
from ..model_selection import best_model, get_historical_data
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
import pandas as pd
import os
import threading
import traceback


class RunModelsViews(APIView):
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

                if 'arimax' in models or 'sarimax' in models:

                    exog = FileRefModel.objects.filter(project_id=scenario.project_id, model_type_id=2).first()
                    exog_projected = FileRefModel.objects.filter(project_id=scenario.project_id, model_type_id=3).first()

                    if exog is None:
                        return Response(data={'error': 'not_exog_data'}, status=status.HTTP_400_BAD_REQUEST)

                    df_exog_data = get_historical_data(table_name=exog.file_name)

                    if exog_projected is not None:
                        df_exog_data_projected = get_historical_data(table_name=exog_projected.file_name)

                # Extract required scenario data
                test_p = scenario.test_p
                pred_p = scenario.pred_p
                error_method = scenario.error_type
                scenario_name = scenario.scenario_name
                table_name = f'Historical_Data_{project.project_name}_user{user}'
                query = f"SELECT * FROM {table_name}"
                df = pd.read_sql_query(query, con=engine)

                max_historical_data_date = pd.to_datetime(df.columns[-1])
                scenario.max_historical_date = max_historical_data_date

                # Get historical data for the scenario
                df_historical = get_historical_data(table_name=table_name)
                seasonal_periods = df_historical['Periods Per Cycle'][0]
                scenario.seasonal_periods = seasonal_periods

                # Excel predictions path
                path = f'media/excel_files/predictions/{table_name}_prediction_results_scenario_{scenario_name}.xlsx'

                def run_models():
                    try:
                        # Run the models and generate predictions
                        if 'arimax' in models or 'sarimax' in models:
                            result = best_model(
                                df_historical=df_historical,
                                test_p=test_p, pred_p=pred_p, models=models,
                                seasonal_periods=seasonal_periods,
                                additional_params=additional_params,
                                error_method=error_method,
                                exog_dataframe=df_exog_data,
                                scenario_name=scenario_name,
                                exog_projected_df=df_exog_data_projected if exog_projected is not None else None)

                        else:
                            result = best_model(df_historical=df_historical,
                                                test_p=test_p, pred_p=pred_p,
                                                seasonal_periods=seasonal_periods,
                                                additional_params=additional_params,
                                                models=models,
                                                error_method=error_method,
                                                scenario_name=scenario_name
                            )

                        with pd.ExcelWriter(path, engine='xlsxwriter') as excel_writer:
                            result.to_excel(excel_writer, sheet_name='result', index=True, merge_cells=False)
                            work_sheet = excel_writer.sheets['result']
                            for i, column in enumerate(result.columns):
                                width_column = max(result[column].astype(str).apply(len).max(),
                                                   len(column)) + 2
                                work_sheet.set_column(i, i, width_column)

                        file_path = os.path.join(settings.MEDIA_ROOT, 'excel_files\\predictions',
                                                 f'{table_name}_prediction_results_scenario_{scenario_name}.xlsx')

                        # Generate graphical predictions
                        graphic = Graphic(
                            file_path=file_path,
                            max_date=max_historical_data_date,
                            error_method=error_method,
                            pred_p=pred_p
                        )

                        final_data, data_per_year, error = graphic.graphic_predictions()

                        # Save the predictions in the scenario
                        scenario.final_data_pred = final_data
                        scenario.data_year_pred = data_per_year
                        scenario.predictions_table_name = f'{table_name}_prediction_results_scenario_{scenario_name}'
                        scenario.error_last_twelve_periods = error
                        scenario.url_predictions = path
                        scenario.additional_params = additional_params
                        dataframe_predictions = pd.read_excel(path)
                        error = Error(dataframe=dataframe_predictions, model_name='', error_method=error_method)
                        scenario.error_last_period, scenario.error_abs = error.calculate_error_last_period(
                                                                            prediction_periods=pred_p)
                        scenario.save()

                        # Save the predicted data as a table
                        save_dataframe(route_file=path,
                                       file_name=f'{table_name}_prediction_results_scenario_{scenario_name}',
                                       model_type="historical_data",
                                       wasSaved=True)

                        result_holder['result'] = result

                    except Exception as errorModels:
                        print("Error en corrida: ", str(errorModels))
                        traceback.print_exc()
                        result_holder['error'] = str(errorModels)

                try:
                    # Run the models in a separate thread
                    result_holder = {'result': None, 'error': None}
                    run_models_thread = threading.Thread(target=run_models)
                    run_models_thread.start()
                    run_models_thread.join()

                    if result_holder['error']:
                        return Response({'error': result_holder['error']}, status=status.HTTP_400_BAD_REQUEST)
                    print("Additional params", additional_params)
                    # Return success message if everything ran successfully
                    return Response({'message': 'succeed'}, status=status.HTTP_200_OK)

                except Exception as e:
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            except ForecastScenario.DoesNotExist:
                # Return not found error if the scenario does not exist
                return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

            except Exception as e:
                # Return a general bad request error for other exceptions
                traceback.print_exc()
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)