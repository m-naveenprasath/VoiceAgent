from django.urls import path
from .views import transcribe_and_extract

urlpatterns = [
    path("transcribe/", transcribe_and_extract),
]
