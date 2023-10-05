from rest_framework import serializers
from .models import ForecastScenario


class ForecastScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastScenario
        fields = '__all__'


class GetScenarioById(serializers.Serializer):
    scenario_id = serializers.IntegerField()

    def validate(self, data):
        scenario_id = data.get('scenario_id')

        if not scenario_id:
            raise serializers.ValidationError({'error': 'scenario_id_not_provided'})

        return data

