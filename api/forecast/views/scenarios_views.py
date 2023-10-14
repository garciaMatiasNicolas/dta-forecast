from rest_framework.decorators import authentication_classes, permission_classes, action
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from ..serializer import ForecastScenarioSerializer
from ..models import ForecastScenario


@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
class ForecastScenarioViewSet(ModelViewSet):
    serializer_class = ForecastScenarioSerializer
    queryset = ForecastScenario.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(user_id=request.user.id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        scenario = self.get_serializer(data=request.data)

        if scenario.is_valid():
            scenario = scenario.save()

            return Response({'message': 'scenario_saved', 'scenario_id': scenario.id}, status=status.HTTP_201_CREATED)

        else:
            return Response({'error': 'bad_request', 'logs': scenario.errors},
                            status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        scenario_to_destroy = self.get_queryset().filter(id=pk).first()

        if scenario_to_destroy:
            scenario_to_destroy.delete()
            return Response({'message': 'scenario_deleted'},
                            status=status.HTTP_200_OK)

        else:
            return Response({'error': 'scenario_not_found'},
                            status=status.HTTP_400_BAD_REQUEST)