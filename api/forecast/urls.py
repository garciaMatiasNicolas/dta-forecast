from django.urls import path
from .views import RunModelsViews

test_model = RunModelsViews.testing_model

urlpatterns = [
    path('test-model', test_model, name='test_model')
]