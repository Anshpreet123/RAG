from django.db import models
from pgvector.django import VectorField  # Import VectorField for embeddings

class Document(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Embedding(models.Model):
    id = models.AutoField(primary_key=True)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="embeddings")
    text_chunk = models.TextField()
    embedding = VectorField(dimensions=1536)  # OpenAI embeddings are 1536-dimensional

    def __str__(self):
        return f"Embedding for {self.document.name}"
