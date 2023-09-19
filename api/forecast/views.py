from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from .model_selection import best_model, get_historical_data
from .models import DataSelectors
from .serializer import DataSelectorSerializer, ModelPredictionSerializer
import pandas as pd


class RunModelsViews:
    @api_view(['POST'])
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def testing_model(request):

        if request.method == 'POST':
            data = ModelPredictionSerializer(data=request.data)

            if data.is_valid():
                # Get validated data from request
                test_p = data.validated_data['test_p']
                pred_p = data.validated_data['pred_p']
                project = data.validated_data['project_name']
                user = data.validated_data['user_owner']
                table_name = f'Historical_Data_{project}_user{user}'

                # Get dataframe and run models
                dataframe = get_historical_data(table_name=table_name)
                result = best_model(dataframe=dataframe, test_p=test_p, pred_p=pred_p)

                # Write excel with model run results
                with pd.ExcelWriter(f'media/excel_files/predictions/{table_name}_prediction_results.xlsx',
                                    engine='xlsxwriter') as excel_writer:
                    result.to_excel(excel_writer, sheet_name='result', index=True, merge_cells=False)

                return Response({'message': 'predictions_saved'}, status=status.HTTP_200_OK)

            else:
                return Response({'error': 'bad_request', 'logs': data.errors}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'method_not_allowed'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
class DataSelectorViewSet(ModelViewSet):
    serializer_class = DataSelectorSerializer
    queryset = DataSelectors.objects.all()

    def create(self, request, *args, **kwargs):
        data_selectors = self.get_serializer(data=request.data)
        user = request.user.id

        if data_selectors.is_valid():
            data_selectors.user = user
            data_selectors.save()

            return Response({'message': 'data_selectors_uploaded', 'data_selectors': data_selectors.data},
                            satus=status.HTTP_201_CREATED)

        else:
            return Response({'error': 'bad_request', 'logs': data_selectors.errors},
                            status=status.HTTP_400_BAD_REQUEST)

