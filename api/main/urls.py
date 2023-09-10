from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('authentication/', include('users.authentication_urls')),
    path('files/', include('files.router')),
    path('projects/', include('projects.router'))
]
