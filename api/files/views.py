from .file_model import FileRefModel
from .filemanager import save_dataframe
from .serializer import FileSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from .filemanager import obtain_file_route
import os


@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
class ExcelFileUploadView(viewsets.ModelViewSet):
    queryset = FileRefModel.objects.all()
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        file_serializer = self.get_serializer(data=request.data)

        if file_serializer.is_valid():
            # Get validated data from request
            model_type = file_serializer.validated_data['model_type']
            file_name = file_serializer.validated_data['file_name']

            # Save file
            file_serializer.save()

            # Get file route and instance DataFrame
            route = file_serializer.data['file']

            # Save dataframe
            try:
                save_dataframe(route_file=route, model_type=model_type, file_name=file_name)
                return Response({'message': 'file_uploaded'},
                                status=status.HTTP_201_CREATED)

            except ValueError:
                route = obtain_file_route(route)

                if os.path.exists(route):
                    os.remove(route)

                return Response({'error': 'columns_not_in_date_type'}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'bad_request', 'logs': file_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)
