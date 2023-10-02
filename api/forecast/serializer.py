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


"""class Scenario(serializers.ModelSerializer):
    class Meta:
        model = ForecastScenario
        fields = ['id', 'scenario_name']


class FilterScenarioByProject(serializers.Serializer):
    project = serializers.IntegerField()

    def validate(self, data):
        project = data.get('project')

        if not project:
            raise serializers.ValidationError({'error': 'project_not_provided'})

        return data


class FilterScenarioById(serializers.Serializer):
    pk = serializers.IntegerField()

    def validate(self, data):
        pk = data.get('pk')

        if not pk:
            return serializers.ValidationError({'error': 'pk_not_provided'})

        return data"""
