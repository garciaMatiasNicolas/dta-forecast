from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from ..model_selection import best_model, get_historical_data
from ..serializer import GetScenarioById
from ..models import ForecastScenario
from projects.models import ProjectsModel
import pandas as pd
import os
from django.conf import settings
from django.http import HttpResponse


class RunModelsViews (APIView):
    @staticmethod
    def graphic_predictions(file_path):
        try:
            df_pred = pd.read_excel(file_path)

        except pd.errors.ParserError:
            return {'error': 'file_not_exists'}

        actual_rows = df_pred[df_pred['model'] == 'actual']
        other_rows = df_pred[df_pred['model'] != 'actual']

        date_columns = df_pred.columns[9:]

        actual_sum = actual_rows[date_columns].sum()

        other_sum = other_rows[date_columns].sum()

        actual_data = {'x': date_columns.tolist(), 'y': actual_sum.tolist()}
        other_data = {'x': date_columns.tolist(), 'y': other_sum.tolist()}

        return {'actual_data': actual_data, 'other_data': other_data}

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
                            path = f'media/excel_files/predictions/{table_name}_prediction_results_scenario{scenario_name}.xlsx'

                            # Write excel with model run results
                            with pd.ExcelWriter(path, engine='xlsxwriter') as excel_writer:
                                result.to_excel(excel_writer, sheet_name='result', index=True, merge_cells=False)

                            graphic = self.graphic_predictions(os.path.join(settings.MEDIA_ROOT, 'excel_files\\predictions',
                                                                            f'{table_name}_prediction_results_scenario{scenario_name}.xlsx'))

                            # Save graphic_data and predictions excel url in the scenario
                            scenario.graphic_data = graphic
                            scenario.url_predictions = path
                            scenario.save()

                            return Response({'message': 'succeed'}, status=status.HTTP_200_OK)

                    else:
                        return Response({'error': 'scenario_not_found'}, status=status.HTTP_200_OK)

                except ForecastScenario.DoesNotExist:
                    return Response({'error': 'not_found'}, status=status.HTTP_200_OK)
        
            else:
                return Response({'error': 'bad_request', 'logs': data.errors}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'method_not_allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)






