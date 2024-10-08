from django.urls import path
from .views.stock_data import StockDataView, StockByProduct
from .views.forecast_views import RunModelsViews, GraphicDataView
from .views.filter_data import FilterDataViews, GetFiltersView, FiltersByGroup, FiltersNested, GetPredictionsTableAPIView
from .views.report_data_view import ReportDataViews, ModelsGraphicAPIView
from .views.mape_report_view import ErrorReportAPIView, ErrorGraphicView, ForecastModelsSelctedGraphAPIView
from .views.exploration_variables_view import (AllocationMatrixView, HistoricalDataView, FilterValuesView,
                                               GetExogVars, ExogenousVariablesTable, ExogenousVariablesGraph, )
from .views.outliers_graphic import GraphicOutliersView, FiltersHistoricalData
from .views.product_all import AllProductView
from .views.conversion_forecast import ConversionForecast
from .views.scenarios_views import SetBestModel

test_model = RunModelsViews.as_view()
filter_data = FilterDataViews.as_view()
filters_nested = FiltersNested.as_view()
get_filters = GetFiltersView.as_view()
filter_by_group = FiltersByGroup.as_view()
report = ReportDataViews.as_view()
report_mape_by_date = ErrorReportAPIView.as_view()
graphic_mape = ErrorGraphicView.as_view()
graphic_model = ModelsGraphicAPIView.as_view()
correlation_matrix = AllocationMatrixView.as_view()
graphic_data = HistoricalDataView.as_view()
filters_exog = FilterValuesView.as_view()
get_vars_names = GetExogVars.as_view()
outliers = GraphicOutliersView.as_view()
filters_outliers = FiltersHistoricalData.as_view()
exog_table = ExogenousVariablesTable.as_view()
exog_graph = ExogenousVariablesGraph.as_view()
stock_data = StockDataView.as_view()
stock_by_product = StockByProduct.as_view()
product_all = AllProductView.as_view()
conversion = ConversionForecast.as_view()
all_models_graph = ForecastModelsSelctedGraphAPIView.as_view()
forecast_table = GetPredictionsTableAPIView.as_view()
forecast_graphic = GraphicDataView.as_view()
set_best_model = SetBestModel.as_view()

urlpatterns = [
    path('test-model', test_model, name='test_model'),
    path('graphic-forecast', forecast_graphic, name="forecast_graphic"),
    path('filter-group', filter_by_group, name='filter_by_group'),
    path('filter-data', filter_data, name='filter_data'),
    path('filters-nested', filters_nested, name='filter_nested'),
    path('get-filters', get_filters, name='get_filters'),
    path('get-filters-historical', filters_outliers, name='filters_outliers'),
    path('get-report', report, name='report'),
    path('report-mape-date', report_mape_by_date, name='report_mape_by_date'),
    path('graphic-mape', graphic_mape, name='graphic_mape'),
    path('graphic-model', graphic_model, name='graphic_model'),
    path('correlation-matrix', correlation_matrix, name='correlation_matrix'),
    path('graphic-data', graphic_data, name='graphic_data'),
    path('filters-exog', filters_exog, name='filters_exog'),
    path('exog-table', exog_table, name='exog_table'),
    path('exog-graph', exog_graph, name='exog_graph'),
    path('get-vars-names', get_vars_names, name='get_vars_names'),
    path('get-outliers', outliers, name='outliers'),
    path('stock-data/', stock_data, name='stock-data'),
    path('stock-product/', stock_by_product, name='stock_by_product'),
    path('product-all', product_all, name="product_all"),
    path('conversion-forecast/', conversion, name="conversion"),
    path('all-models-graph', all_models_graph, name="all_models_graph"),
    path('predictions-table/', forecast_table, name="forecast_table"),
    path('set-best-model', set_best_model, name="set_best_model")
]