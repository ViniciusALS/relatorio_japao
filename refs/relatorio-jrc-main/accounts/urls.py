from django.contrib import admin
from django.urls import path

from accounts import views

urlpatterns = [
    # path('register/', views.SignUp.as_view(), name='register'),
    path('forgotten_password/', views.forgotten_password, name='forgotten'),
]