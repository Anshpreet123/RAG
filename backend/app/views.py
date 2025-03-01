import os
import openai
import json
import PyPDF2
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Document, Embedding
from .utils import generate_embedding,query_pgvector
from asgiref.sync import sync_to_async
from django.db.models import F

@csrf_exempt
async def upload_document(request):
    if request.method == "POST" and request.FILES.get("file"):
        pdf_file = request.FILES["file"]

        # Save file temporarily
        file_path = default_storage.save(pdf_file.name, ContentFile(pdf_file.read()))
        file_full_path = os.path.join(default_storage.location, file_path)
        print('file_full_path:',file_full_path)

        # Extract text from PDF
        text = ""
        with open(file_full_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                extracted_text = page.extract_text()
                if extracted_text:
                    text += extracted_text + "\n"
        print('text:',text)
        # Remove temp file
        os.remove(file_full_path)

        if not text.strip():
            return JsonResponse({"error": "No text extracted from document"}, status=400)

        # Store document (without text field)
        document = await sync_to_async(Document.objects.create)(
            name=pdf_file.name, file=pdf_file
        )
        print('document:',document)

        # Generate and store embeddings
        chunks = [text[i:i+500] for i in range(0, len(text), 500)]  # Chunking
        for chunk in chunks:
            embedding_vector = await sync_to_async(generate_embedding)(chunk)
            await sync_to_async(Embedding.objects.create)(
                document=document, text_chunk=chunk, embedding=embedding_vector
            )

        return JsonResponse({"message": "Document uploaded and processed successfully"})
    
    return JsonResponse({"error": "Invalid request"}, status=400)
    

@csrf_exempt
async def query_document(request):
    if request.method == "POST":
        try:
            client = openai.AsyncOpenAI()
            data = json.loads(request.body)  # Handle JSON payloads properly
            user_query = data.get("query")

            if not user_query:
                return JsonResponse({"error": "Query is required"}, status=400)

            print("User Query:", user_query)

            # Convert query to embedding
            query_embedding = await sync_to_async(generate_embedding)(user_query)
            print("Query Embedding: Generated successfully")
            # print("query_embedding:", query_embedding)

            # Retrieve top matching chunks (Using sync_to_async)
            results = await query_pgvector(query_embedding)
            print("Results:", results)

            if results:
                # Construct augmented prompt
                context_text = "\n".join([r["text_chunk"] for r in results])
                prompt = f"Use the following context to answer the question:\n\n{context_text}\n\nQ: {user_query}\nA:"
            else:
                # Fallback: Generate response without augmentation
                prompt = f"Answer the following question based on your knowledge:\n\nQ: {user_query}\nA:"

            # Get response from OpenAI
            response = await client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI assistant."},
                    {"role": "user", "content": prompt}
                ]
            )

            return JsonResponse({"response": response.choices[0].message.content})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)
