from rest_framework import serializers
from .models import FileRefModel


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileRefModel
        exclude = ('uploaded_at',)
