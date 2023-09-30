import json

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
    run_mode = models.CharField(max_length=200)
    top_down_dimensions = models.CharField(max_length=200)
    optimized_metrics = models.CharField(max_length=200)
    forecast_dims = models.CharField(max_length=200)
    replace_outliers = models.CharField(max_length=200)
    interpolate_negatives = models.CharField(max_length=345)
    interpolate_zeros = models.CharField(max_length=345)
    interpolation_methods = models.CharField(max_length=345)
    outliers_detection = models.CharField(max_length=345)
    missing_values_t = models.CharField(max_length=345)
    pex_variables = models.CharField(max_length=345)
    models = models.TextField()

    def set_models(self, model_list: list):
        self.models = json.dumps(model_list)

    def get_models(self):
        return json.loads(self.models)
