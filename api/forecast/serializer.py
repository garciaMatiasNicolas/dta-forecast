from rest_framework import serializers
from .models import ForecastScenario


class ForecastScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastScenario
        exclude = ('user',)


class Scenario(serializers.ModelSerializer):
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

        return data


class ModelPredictionSerializer(serializers.Serializer):
    test_p = serializers.IntegerField()
    pred_p = serializers.IntegerField()
    project_name = serializers.CharField()
    user_owner = serializers.IntegerField()

    def validate(self, data):
        test_p = data.get('test_p')
        pred_p = data.get('pred_p')
        project = data.get('project_name')
        user_owner = data.get('user_owner')

        if not test_p:
            raise serializers.ValidationError({'error': 'test_p_not_provided'})

        if not pred_p:
            raise serializers.ValidationError({'error': 'pred_p_not_provided'})

        if not project:
            raise serializers.ValidationError({'error': 'project_not_provided'})

        if not user_owner:
            raise serializers.ValidationError({'error': 'user_not_provided'})

        return data