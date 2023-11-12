from django.urls import path
from .views import GetFileTypes

file_types = GetFileTypes.as_view()

urlpatterns = [
    path('file-types', file_types, name='file_types')
]