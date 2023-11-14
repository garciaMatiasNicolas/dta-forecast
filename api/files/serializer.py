from rest_framework import serializers
from .file_model import FileRefModel, FileTypes


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileRefModel
        exclude = ('uploaded_at',)

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'file_name': instance.file_name,
            'model_type': instance.model_type.model_type,
            'file': instance.file.url,
            'project': instance.project_id
        }


class FileModelType(serializers.ModelSerializer):
    class Meta:
        model = FileTypes
        fields = '__all__'