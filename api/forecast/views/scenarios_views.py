from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from ..serializer import ForecastScenarioSerializer
from ..models import ForecastScenario
from django.db import transaction, connection, OperationalError
import os
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404


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
            project_id = scenario.validated_data['project']
            scenario_name = scenario.validated_data['scenario_name']

            search_scenario_name = ForecastScenario.objects.filter(project_id=project_id, scenario_name=scenario_name)

            if search_scenario_name.exists():
                return Response({'error': 'scenario_name_already_exists'}, status=status.HTTP_400_BAD_REQUEST)

            scenario = scenario.save()

            return Response({'message': 'scenario_saved', 'scenario_id': scenario.id},
                            status=status.HTTP_201_CREATED)

        else:
            return Response({'error': 'bad_request', 'logs': scenario.errors},
                            status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        scenario_to_update = self.get_queryset().filter(id=pk).first()
        scenario_name = request.data.get("scenario_name")

        if scenario_to_update:
            scenario_to_update.scenario_name = scenario_name
            scenario_to_update.save()
            return Response({'message': 'scenario_name_updated'}, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'scenario_not_found'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        scenario_to_destroy = self.get_queryset().filter(id=pk).first()

        if scenario_to_destroy:
            table_name = scenario_to_destroy.predictions_table_name
            excel_with_predictions = scenario_to_destroy.url_predictions if scenario_to_destroy.url_predictions is not None else ""

            try:
                with transaction.atomic():

                    # Intentar eliminar la tabla de predicciones
                    if table_name:
                        with connection.cursor() as cursor:
                            try:
                                cursor.execute(f'DROP TABLE IF EXISTS `{table_name}`;')  
                            except OperationalError as dbError:
                                print("ERROR AL ELIMINAR TABLA: ", dbError)
                                raise

                    if excel_with_predictions and os.path.exists(excel_with_predictions):
                        try:
                            os.remove(excel_with_predictions)
                        except Exception as fileError:
                            print("ERROR AL ELIMINAR ARCHIVO: ", fileError)
                            raise

                    scenario_to_destroy.delete()

                    return Response({'message': 'scenario_deleted'}, status=status.HTTP_200_OK)

            except OperationalError as dbError:
                print("ERROR CON LA BASE DE DATOS: ", dbError)
                return Response({'error': 'table_not_deleted'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            except Exception as error:
                print("ERROR GENERAL: ", error)
                return Response({'error': 'server_error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response({'error': 'scenario_not_found'}, status=status.HTTP_404_NOT_FOUND)


class SetBestModel(APIView):
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request):
        try:
            data = request.data
            
            new_model = data["new_model"]
            old_model = data["old_model"]
            sc_id = data["scenario_id"]
            product = data["product"]

            # Obtén el escenario a partir del id
            scenario = get_object_or_404(ForecastScenario, pk=sc_id)
            
            # Nombre de la tabla de predicciones
            table = scenario.predictions_table_name

            # Construcción de las condiciones para la query
            conditions = " AND ".join([f"{key} = '{value}'" for key, value in product.items()])

            with connection.cursor() as cursor:
                # Query para actualizar `best_model` a 1 para el `new_model`
                update_new_model_query = f"""
                    UPDATE {table}
                    SET best_model = 1
                    WHERE {conditions}
                    AND model = '{new_model}'
                """
                cursor.execute(update_new_model_query)

                # Query para actualizar `best_model` a 0 para el `old_model`
                update_old_model_query = f"""
                    UPDATE {table}
                    SET best_model = 0
                    WHERE {conditions}
                    AND model = '{old_model}'
                """
                cursor.execute(update_old_model_query)

            return Response({"message": "Modelo actualizado correctamente"}, status=200)
        
        except Exception as e:
            print(f"Error actualizando el modelo ganador: {e}")
            return Response({"error": str(e)}, status=500)