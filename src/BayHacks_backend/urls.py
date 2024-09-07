# authentication/urls.py

from dj_rest_auth.jwt_auth import get_refresh_view
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView, LogoutView, UserDetailsView
from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from allauth.socialaccount.views import signup
from .views import GoogleLoginView, GoogleLoginView2, GetCookies, CSRF_Token, SendEmail, UserInfo

urlpatterns = [
    path("register/", RegisterView.as_view(), name="rest_register"),
    path("login/", LoginView.as_view(), name="rest_login"),
    path("logout/", LogoutView.as_view(), name="rest_logout"),
    path("user/", UserDetailsView.as_view(), name="rest_user_details"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("token/refresh/", get_refresh_view().as_view(), name="token_refresh"),
    path("auth/google/", GoogleLoginView.as_view(), name="google_login"),
    path("auth/google2/", GoogleLoginView2.as_view(), name="google_login2"),
    path("getCookies", GetCookies.as_view(), name="get_cookies"),
    path("csrf_token", CSRF_Token.as_view(), name="csrf_token"),
    path("sendEmail", SendEmail.as_view(), name="sendEmail"),
    path("getUserinfo", UserInfo.as_view(), name="getUserinfo"),
]