from django.urls import path
from .authentication import UserAuthenticationViews

login = UserAuthenticationViews.LogInView.as_view()
logout = UserAuthenticationViews.LogOutView.as_view()
confirm = UserAuthenticationViews.confirm_email

urlpatterns = [
    path('login', login, name='login_view'),
    path('logout', logout, name='logout_view'),
    path('user-confirm/<int:pk>', confirm, name='confirmation_endpoint')
]