from rest_framework.decorators import authentication_classes, permission_classes
from ..graphic_predictions_per_year import graphic_predictions_per_year
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
from django.db import connection
from database.db_engine import engine
from ..mape_cacl import mape_calc_last_period
import pandas as pd
import numpy as np
import os
import threading
import traceback


class RunModelsViews(APIView):
    @staticmethod
    def graphic_predictions(file_path, max_date, pred_p):
        try:
            df_pred = pd.read_excel(file_path)
        except pd.errors.ParserError:
            return {'error': 'file_not_exists'}

        mape = df_pred['MAPE']
        mape = np.mean(mape)
        mape = round(mape, 2)
        max_date = pd.to_datetime(max_date)
        df_pred = df_pred.drop(columns=['MAPE'])
        date_columns = df_pred.columns[9:]

        actual_rows = df_pred[df_pred['model'] == 'actual']
        other_rows = df_pred[df_pred['model'] != 'actual']

        actual_sum = actual_rows[date_columns].sum()

        other_sum = other_rows[date_columns].sum()

        actual_data = {'x': date_columns.tolist(), 'y': actual_sum.tolist()}

        dates = actual_data['x'][:-pred_p]
        values = actual_data['y'][:-pred_p]

        actual_data['x'] = dates
        actual_data['y'] = values

        other_data = {'x': date_columns.tolist(), 'y': other_sum.tolist()}

        final_data = {'actual_data': actual_data, 'other_data': other_data}
        data_per_year = graphic_predictions_per_year(data=final_data, max_date=max_date)

        return final_data, data_per_year, mape

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

                    with connection.cursor() as cursor:
                        '''
                        QUERY FOR MYSQL = SHOW TABLES LIKE \'{table_name}\' 
                        '''

                        query = f'''SELECT name FROM sqlite_master 
                                    WHERE type='table' 
                                    AND name='Historical_Exogenous_Variables_{project.project_name}_user{user}' '''
                        cursor.execute(query)

                        table_exog_vars = cursor.fetchone()

                        if table_exog_vars is None:
                            return Response({'error': 'exogenous_variables_not_found'},
                                            status=status.HTTP_400_BAD_REQUEST)

                        df_exog_data = get_historical_data(table_name=table_exog_vars[0])

                # Extract required scenario data
                test_p = scenario.test_p
                pred_p = scenario.pred_p
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
                            result = best_model(df_historical=df_historical,
                                                test_p=test_p, pred_p=pred_p,
                                                models=models,
                                                seasonal_periods=seasonal_periods,
                                                additional_params=additional_params,
                                                exog_dataframe=df_exog_data)

                        else:
                            result = best_model(df_historical=df_historical,
                                                test_p=test_p, pred_p=pred_p,
                                                seasonal_periods=seasonal_periods,
                                                additional_params=additional_params,
                                                models=models)

                        with pd.ExcelWriter(path, engine='xlsxwriter') as excel_writer:
                            result.to_excel(excel_writer, sheet_name='result', index=True, merge_cells=False)
                            work_sheet = excel_writer.sheets['result']
                            for i, column in enumerate(result.columns):
                                width_column = max(result[column].astype(str).apply(len).max(),
                                                   len(column)) + 2
                                work_sheet.set_column(i, i, width_column)

                        # Generate graphical predictions
                        final_data, data_per_year, mape = self.graphic_predictions(
                            file_path=os.path.join(settings.MEDIA_ROOT, 'excel_files\\predictions', f'{table_name}_prediction_results_scenario_{scenario_name}.xlsx'),
                            max_date=max_historical_data_date,
                            pred_p=pred_p
                        )

                        # Save the predictions in the scenario
                        scenario.final_data_pred = final_data
                        scenario.data_year_pred = data_per_year
                        scenario.predictions_table_name = f'{table_name}_prediction_results_scenario_{scenario_name}'
                        scenario.mape_last_twelve_periods = mape
                        scenario.url_predictions = path
                        scenario.additional_params = additional_params
                        dataframe_predictions = pd.read_excel(path)
                        scenario.mape_last_period, scenario.mape_abs = mape_calc_last_period(
                                                                            dataframe=dataframe_predictions,
                                                                            predictions_periods=pred_p)
                        scenario.save()

                        # Save the predicted data as a table
                        save_dataframe(route_file=path,
                                       file_name=f'{table_name}_prediction_results_scenario_{scenario_name}',
                                       model_type="historical_data", wasSaved=True)

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
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)