import openai
import numpy as np
import os
from django.db import connection
from asgiref.sync import sync_to_async

# OpenAI API Key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_embedding(text):
    """Generate embeddings using OpenAI API"""
    client = openai.OpenAI()  # Initialize the client
    response = client.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

async def query_pgvector(query_embedding):
    """Retrieve the top matching chunks using pgvector asynchronously"""

    query = """
    SELECT text_chunk, 1 - (embedding <=> %s::vector) AS similarity
    FROM app_embedding
    ORDER BY similarity DESC
    LIMIT 5;
    """

    def fetch_results():
        with connection.cursor() as cursor:
            cursor.execute(query, [query_embedding])  # Pass embedding directly
            return [{"text_chunk": row[0], "similarity": row[1]} for row in cursor.fetchall()]

    results = await sync_to_async(fetch_results, thread_sensitive=True)()
    return results