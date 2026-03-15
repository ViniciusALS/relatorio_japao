from django.shortcuts import render
from accounts.forms import UserCreationForm
from django.urls import reverse_lazy
from django.views import generic
from .forms import EmailFormForForgottenPassword

# class SignUp(generic.CreateView):
#     form_class = UserCreationForm
#     success_url = reverse_lazy('login')
#     template_name = 'registration/register.html'

def forgotten_password(request):
    form = EmailFormForForgottenPassword()
    if request.method == "POST":
        if form.is_valid():
            #Ação a ser feita
            email = form.cleaned_data['email']
    return render(request, 'registration/forgotten_password.html',{'form':form})
