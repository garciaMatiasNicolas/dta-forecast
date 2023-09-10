from django.db import models
from users.models import User
from projects.models import ProjectsModel


class FileRefModel(models.Model):
    user_owner = models.ForeignKey(User,  on_delete=models.CASCADE)
    file_name = models.CharField(max_length=200, unique=True)
    file = models.FileField(upload_to='excel_files/')
    project = models.ForeignKey(ProjectsModel, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)