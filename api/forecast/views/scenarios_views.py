from rest_framework.decorators import authentication_classes, permission_classes, action
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from ..serializer import ForecastScenarioSerializer, FilterScenarioByProject, FilterScenarioById, Scenario
from ..models import ForecastScenario


@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
class ForecastScenarioViewSet(ModelViewSet):
    serializer_class = ForecastScenarioSerializer
    queryset = ForecastScenario.objects.all()

    @action(detail=False, methods=['post'])
    def get_scenario_data(self, request):
        data = FilterScenarioById(data=request.data)

        if data.is_valid():
            pk = data.validated_data['pk']
            scenario = self.get_queryset().filter(id=pk)
            serializer = ForecastScenarioSerializer(scenario, many=True)
            if scenario:
                return Response(serializer.data)
            else:
                return Response({'not_found': 'scenario_not_found'}, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'bad_request', 'logs': data.errors}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def get_scenario_names(self, request):
        data = FilterScenarioByProject(data=request.data)

        if data.is_valid():
            project_id = data.validated_data["project"]
            scenario = self.get_queryset().filter(project=project_id)

            if scenario:
                serializer = Scenario(scenario, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

            else:
                return Response({'not_found': 'scenario_not_found'}, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'bad_request', 'logs': data.errors}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        scenario = self.get_serializer(data=request.data)
        user = request.user.id

        if scenario.is_valid():
            scenario.user = user
            scenario.save()

            return Response({'message': 'data_selectors_uploaded', 'data_selectors': scenario.data},
                            satus=status.HTTP_201_CREATED)

        else:
            return Response({'error': 'bad_request', 'logs': scenario.errors},
                            status=status.HTTP_400_BAD_REQUEST)

