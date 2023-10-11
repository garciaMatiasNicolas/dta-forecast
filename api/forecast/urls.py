from django.urls import path
from .views.forecast_views import RunModelsViews
from .views.filter_data import FilterDataViews, GetFiltersView

test_model = RunModelsViews.as_view()
filter_data = FilterDataViews.as_view()
get_filters = GetFiltersView.as_view()

urlpatterns = [
    path('test-model', test_model, name='test_model'),
    path('filter-data', filter_data, name='filter_data'),
    path('get-filters', get_filters, name='get_filters')
]