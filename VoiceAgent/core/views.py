import os
import tempfile
import traceback
import openai
import assemblyai as aai

from dotenv import load_dotenv
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

# Prompt to extract structured data
FORM_EXTRACTION_PROMPT = (
    "Extract the following fields from the user's home loan query paragraph as JSON:\n"
    "Fields: name, dateofbirth, loan_amount, tenure_years, monthly_income, location.\n"
    "Return only valid JSON without explanation.\n"
    "Example:\n"
    "{\n"
    "  \"name\": \"Naveen Prasath\",\n"
    "  \"dob\": \"21-10-1998\",\n"
    "  \"loan_amount\": 4000000,\n"
    "  \"tenure_years\": 15,\n"
    "  \"monthly_income\": 60000,\n"
    "  \"location\": \"Chennai\"\n"
    "}"
)

@api_view(['POST'])
@parser_classes([MultiPartParser])
def transcribe_and_extract(request):
    try:
        audio_file = request.FILES.get("audio")
        if not audio_file:
            return Response({"error": "No audio file uploaded."}, status=400)

        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            for chunk in audio_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        # Transcribe with AssemblyAI
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(tmp_path)
        text = transcript.text

        # Ask GPT to extract form data
        gpt_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": FORM_EXTRACTION_PROMPT},
                {"role": "user", "content": text}
            ]
        )
        extracted_json = gpt_response["choices"][0]["message"]["content"]
        print("📄 Transcript:", transcript.text)
        print("🧠 GPT Output:", extracted_json)

        return Response({
            "transcript": text,
            "fields": eval(extracted_json)  # Caution: You can use json.loads() if it's a valid JSON string
        })

    except Exception as e:
        print("❌ Backend error:", e)
        traceback.print_exc()
        return Response({"error": "Something went wrong."}, status=500)
