from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Reports

@login_required
def reports(request):
    reports = Reports.objects.all()
    return render(request, 'reports/report_initial.html', {'reports' : reports})

@login_required
def reports_register(request):
    return render(request, 'reports/report_register.html')
