from rest_framework import serializers
from .file_model import FileRefModel, FileTypes


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileRefModel
        exclude = ('uploaded_at',)


class FileModelType(serializers.ModelSerializer):
    class Meta:
        model = FileTypes
        fields = '__all__'