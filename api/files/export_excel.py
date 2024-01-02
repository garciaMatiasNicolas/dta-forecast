from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import authentication_classes, permission_classes
from .serializer import ExcelToExportSerializer
from projects.models import ProjectsModel
import pandas as pd


class ExportExcelAPIView(APIView):
    @staticmethod
    def create_excel(rows: list, columns: list):
        try:
            dataframe = pd.DataFrame(rows, columns=columns)
            return dataframe

        except Exception as e:
            raise ValueError(f"Error: {str(e)}")

    @authentication_classes([])
    @permission_classes([])
    def post(self, request):
        serializer = ExcelToExportSerializer(data=request.data)

        if serializer.is_valid():
            project = ProjectsModel.objects.filter(id=serializer.validated_data['project_pk']).first()
            try:
                dataframe = self.create_excel(rows=serializer.validated_data['rows'],
                                              columns=serializer.validated_data['columns'])

            except ValueError as ve:
                return Response({'error': 'error_creating_dataframe', 'logs': str(ve)},
                                status=status.HTTP_400_BAD_REQUEST)

            file_name = serializer.validated_data['file_name']
            path = f'media/excel_files/exported_files/{file_name}_project_{project.project_name}.xlsx'

            try:
                dataframe.to_excel(path, index=False)

                file_url = f'http://localhost:8000/{path}'
                return Response({'file_url': file_url}, status=status.HTTP_200_OK)

            except Exception as e:
                return Response({'error': 'error_saving_excel', 'logs': str(e)},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response({'error': 'bad_request', 'logs': serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)
