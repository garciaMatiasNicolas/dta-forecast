from django.db import models
from users.models import User
from projects.models import ProjectsModel


class FileRefModel(models.Model):
    user_owner = models.ForeignKey(User,  on_delete=models.CASCADE)
    file_name = models.CharField(max_length=200, unique=True)
    file = models.FileField(upload_to='excel_files/')
    project = models.ForeignKey(ProjectsModel, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class HistoricalData(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    Family = models.CharField(max_length=200)
    Region = models.CharField(max_length=200)
    Salesman = models.CharField(max_length=200)
    Client = models.CharField(max_length=200)
    Category = models.CharField(max_length=200)
    Subcategory = models.CharField(max_length=200)
    SKU = models.CharField(max_length=200)
    Description = models.CharField(max_length=200)
    StartingYear = models.CharField(max_length=200)
    StartingPeriod = models.CharField(max_length=200)
    PeriodsPerYear = models.CharField(max_length=200)
    PeriodsPerCycle = models.CharField(max_length=200)

