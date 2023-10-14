from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from .serializers import ProjectSerializer
from .models import ProjectsModel


class ProjectsViewSet(ModelViewSet):
    serializer_class = ProjectSerializer
    queryset = ProjectsModel.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def list(self, request, *args, **kwargs):
        user_id = request.user.id

        queryset = self.get_queryset().filter(user_owner=user_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        project_serializer = self.get_serializer(data=request.data)

        if project_serializer.is_valid():
            project_serializer.save()
            return Response({'message': 'project_created', 'project': project_serializer.data},
                            status=status.HTTP_201_CREATED)

        else:
            return Response({'error': 'bad_request', 'logs': project_serializer.errors},
                            status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        project_to_update = self.get_queryset().filter(id=pk).first()

        if project_to_update:
            project_serializer = self.get_serializer(data=request.data)
            if project_serializer.is_valid():
                project_serializer.save()
                return Response({'message': 'project_updated', 'project': project_serializer.data},
                                status=status.HTTP_200_OK)
            else:
                return Response({'error': 'bad_request', 'logs': project_serializer.errors},
                                status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'project_not_found'},
                            status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        type_of_delete = request.data.get('type')
        project_to_delete = self.get_queryset().filter(id=pk).first()

        if project_to_delete:

            if type_of_delete == 'status':
                project_to_delete.status = False
                project_to_delete.save()
                return Response({'message': 'status_project_changed'},
                                status=status.HTTP_200_OK)

            else:
                project_to_delete.delete()
                return Response({'message': 'project_deleted'},
                                status=status.HTTP_200_OK)

        else:
            return Response({'error': 'project_not_found'},
                            status=status.HTTP_400_BAD_REQUEST)
