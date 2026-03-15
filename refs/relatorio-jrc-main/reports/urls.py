from django.contrib import admin
from django.urls import path

from reports import views

urlpatterns = [
    path('reports/report_register', views.reports_register, name='reports_register'),
]