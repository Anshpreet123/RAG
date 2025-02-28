from django.contrib import admin
from .models import Document, Embedding

admin.site.register(Document)
admin.site.register(Embedding)