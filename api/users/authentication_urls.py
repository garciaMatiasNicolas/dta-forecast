from django.urls import path
from .authentication import UserAuthenticationViews

login = UserAuthenticationViews.LogInView.as_view()
logout = UserAuthenticationViews.LogOutView.as_view()

urlpatterns = [
    path('login', login, name='login_view'),
    path('logout', logout, name='logout_view'),
]