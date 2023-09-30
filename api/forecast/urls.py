from django.urls import path
from .views.forecast_views import RunModelsViews

test_model = RunModelsViews.as_view()

urlpatterns = [
    path('test-model', test_model, name='test_model')
]