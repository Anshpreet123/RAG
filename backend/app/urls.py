from django.urls import path
from .views import upload_document, query_document

urlpatterns = [
    path("upload", upload_document, name="upload_document"),
    path("query", query_document, name="query_document"),
]
