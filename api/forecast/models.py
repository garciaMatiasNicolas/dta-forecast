from django.db import models
from users.models import User
from projects.models import ProjectsModel
from files.file_model import FileRefModel


class ForecastScenario(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(ProjectsModel, on_delete=models.CASCADE)
    file_id = models.ForeignKey(FileRefModel, on_delete=models.CASCADE)
    scenario_name = models.CharField(max_length=200, unique=True)
    pred_p = models.IntegerField()
    test_p = models.IntegerField()
    graphic_data = models.JSONField(blank=True, null=True)
    url_predictions = models.CharField(max_length=500, blank=True, null=True)
    models = models.JSONField(default=list)


