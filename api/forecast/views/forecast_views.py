from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from ..model_selection import best_model, get_historical_data
from ..serializer import GetScenarioById
from ..models import ForecastScenario
import pandas as pd


class RunModelsViews (APIView):
    @staticmethod
    def graphic_predictions(df_pred):
        actual_rows = df_pred[df_pred.index.get_level_values('model') == 'actual']
        other_rows = df_pred[df_pred.index.get_level_values('model') != 'actual']

        date_columns = df_pred.columns[9:]

        actual_sum = actual_rows[date_columns].sum()

        other_sum = other_rows[date_columns].sum()

        actual_data = {'x': date_columns.tolist(), 'y': actual_sum.tolist()}
        other_data = {'x': date_columns.tolist(), 'y': other_sum.tolist()}

        return {'actual_data': actual_data, 'other_data': other_data}

    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        data = GetScenarioById(data=request.data)






            scenario_id = data.validated_data.get("scenario_id")

            try:
                scenario = ForecastScenario.objects.filter(pk=scenario_id).first()

                return Response({'scenario': 'found'}, status=status.HTTP_200_OK)

            except ForecastScenario.DoesNotExist:
                return Response({'scenario': 'not_found'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'bad_request', 'logs': data.errors}, status=status.HTTP_400_BAD_REQUEST)

            """# Get dataframe and run models
                dataframe = get_historical_data(table_name=table_name)
                result = best_model(dataframe=dataframe, test_p=test_p, pred_p=pred_p)
                n = 0

                # Write excel with model run results
                with pd.ExcelWriter(f'media/excel_files/predictions/{table_name}_prediction_results.xlsx',
                                    engine='xlsxwriter') as excel_writer:
                    result.to_excel(excel_writer, sheet_name='result', index=True, merge_cells=False)

                # Return graphic
                # dataframe_to_graphic = f'media/excel_files/predictions/{table_name}_prediction_results.xlsx'

           return Response({'message': 'predictions_saved'},
                                status=status.HTTP_200_OK)"""






