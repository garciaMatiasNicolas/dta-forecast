from django.urls import path
from .views.forecast_views import RunModelsViews
from .views.filter_data import FilterDataViews, GetFiltersView
from .views.report_data_view import ReportDataViews, ModelsGraphicAPIView
from .views.mape_report_view import ErrorReportAPIView, ErrorGraphicView
from .views.exploration_variables_view import AllocationMatrixView, HistoricalDataView, FilterValuesView, GetExogVars
from .views.outliers_graphic import GraphicOutliersView

test_model = RunModelsViews.as_view()
filter_data = FilterDataViews.as_view()
get_filters = GetFiltersView.as_view()
report = ReportDataViews.as_view()
report_mape_by_date = ErrorReportAPIView.as_view()
graphic_mape = ErrorGraphicView.as_view()
graphic_model = ModelsGraphicAPIView.as_view()
correlation_matrix = AllocationMatrixView.as_view()
graphic_data = HistoricalDataView.as_view()
filters_exog = FilterValuesView.as_view()
get_vars_names = GetExogVars.as_view()
outliers = GraphicOutliersView.as_view()

urlpatterns = [
    path('test-model', test_model, name='test_model'),
    path('filter-data', filter_data, name='filter_data'),
    path('get-filters', get_filters, name='get_filters'),
    path('get-report', report, name='report'),
    path('report-mape-date', report_mape_by_date, name='report_mape_by_date'),
    path('graphic-mape', graphic_mape, name='graphic_mape'),
    path('graphic-model', graphic_model, name='graphic_model'),
    path('correlation-matrix', correlation_matrix, name='correlation_matrix'),
    path('graphic-data', graphic_data, name='graphic_data'),
    path('filters-exog', filters_exog, name='filters_exog'),
    path('get-vars-names', get_vars_names, name='get_vars_names'),
    path('get-outliers', outliers, name='outliers')
]