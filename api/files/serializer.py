from rest_framework import serializers
from .models import FileRefModel


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileRefModel
        fields = ('file_name', 'user_owner', 'project', 'file')