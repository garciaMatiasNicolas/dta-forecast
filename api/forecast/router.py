from rest_framework.routers import DefaultRouter
from .views import DataSelectorViewSet

router_data_selector = DefaultRouter()

router_data_selector.register('', DataSelectorViewSet, basename='data_selectors')

urlpatterns = router_data_selector.urls