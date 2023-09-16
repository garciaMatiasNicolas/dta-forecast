from rest_framework import serializers
from .file_model import FileRefModel


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileRefModel
        exclude = ('uploaded_at',)
