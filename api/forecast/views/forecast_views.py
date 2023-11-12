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
from datetime import datetime
import pandas as pd
import numpy as np
import os


class RunModelsViews(APIView):

    @staticmethod
    def graphic_predictions(file_path):
        try:
            df_pred = pd.read_excel(file_path)
        except pd.errors.ParserError:
            return {'error': 'file_not_exists'}

        mape = df_pred['MAPE']
        mape = np.mean(mape)
        mape = round(mape, 2)

        df_pred = df_pred.drop(columns=['MAPE'])
        date_columns = df_pred.columns[9:]

        actual_rows = df_pred[df_pred['model'] == 'actual']
        other_rows = df_pred[df_pred['model'] != 'actual']

        actual_sum = actual_rows[date_columns].sum()

        other_sum = other_rows[date_columns].sum()

        actual_data = {'x': date_columns.tolist(), 'y': actual_sum.tolist()}
        other_data = {'x': date_columns.tolist(), 'y': other_sum.tolist()}

        final_data = {'actual_data': actual_data, 'other_data': other_data}
        data_per_year = graphic_predictions_per_year(data=final_data)

        return final_data, data_per_year, mape

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):

        if request.method == "POST":
            # Get from request body scenario id
            data = GetScenarioById(data=request.data)

            if data.is_valid():
                scenario_id = data.validated_data.get("scenario_id")

                try:
                    # Search scenario by id
                    scenario = ForecastScenario.objects.filter(pk=scenario_id).first()

                    # If scenario exists
                    if scenario:
                        project = ProjectsModel.objects.filter(pk=scenario.project.id).first()

                        if project:
                            # Get scenario data
                            test_p = scenario.test_p
                            pred_p = scenario.pred_p
                            user = scenario.user.id
                            scenario_name = scenario.scenario_name
                            models = scenario.models
                            table_name = f'Historical_Data_{project.project_name}_user{user}'

                            # Get dataframe run models
                            dataframe = get_historical_data(table_name=table_name)
                            result = best_model(dataframe=dataframe, test_p=test_p, pred_p=pred_p, models=models)
                            path = f'media/excel_files/predictions/{table_name}_prediction_results_scenario_{scenario_name}.xlsx'

                            # Write excel with model run results
                            with pd.ExcelWriter(path, engine='xlsxwriter') as excel_writer:
                                result.to_excel(excel_writer, sheet_name='result', index=True, merge_cells=False)
                                work_sheet = excel_writer.sheets['result']

                                for i, column in enumerate(result.columns):
                                    width_column = max(result[column].astype(str).apply(len).max(),
                                                        len(column)) + 2
                                    work_sheet.set_column(i, i, width_column)

                            final_data, data_per_year, mape = self.graphic_predictions(
                                os.path.join(settings.MEDIA_ROOT, 'excel_files\\predictions',
                                                f'{table_name}_prediction_results_scenario_{scenario_name}.xlsx'))

                            # Save graphic_data and predictions excel url in the scenario
                            scenario.final_data_pred = final_data
                            scenario.data_year_pred = data_per_year
                            scenario.predictions_table_name = f'{table_name}_prediction_results_scenario_{scenario_name}'
                            scenario.mape_scenario = mape
                            scenario.url_predictions = path
                            scenario.save()

                            # Create table with predicted data
                            save_dataframe(route_file=path,
                                            file_name=f'{table_name}_prediction_results_scenario_{scenario_name}',
                                            model_type="historical_data", wasSaved=True)

                            return Response({'message': 'succeed'}, status=status.HTTP_200_OK)

                    else:
                        return Response({'error': 'scenario_not_found'}, status=status.HTTP_200_OK)

                except ForecastScenario.DoesNotExist:
                    return Response({'error': 'not_found'}, status=status.HTTP_200_OK)

                else:
                    return Response({'error': 'bad_request', 'logs': data.errors}, status=status.HTTP_400_BAD_REQUEST)

            else:
                return Response({'error': 'method_not_allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

            