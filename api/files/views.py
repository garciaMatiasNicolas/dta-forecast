from rest_framework import viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from .models import FileRefModel
from .serializer import FileSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import authentication_classes, permission_classes
from .filemanager import save_dataframe


@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
class ExcelFileUploadView(viewsets.ModelViewSet):
    queryset = FileRefModel.objects.all()
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        file_serializer = self.get_serializer(data=request.data)
        file = request.data.get('file_name', None)
        user = request.data.get('user_owner', None)
        project = request.data.get('project', None)

        if file_serializer.is_valid():
            file_serializer.save()
            save_dataframe(file_name=file, user=user, project=project)
            return Response({'message': 'file_uploaded'},
                            status=status.HTTP_201_CREATED)



        else:
            return Response({'error': 'bad_request', 'logs': file_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)
