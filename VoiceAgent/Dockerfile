FROM python:3.11

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# === requirements.txt ===
django
djangorestframework
dotenv
openai
assemblyai
elevenlabs

# === docker-compose.yml ===
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - .:/app
    command: python manage.py runserver 0.0.0.0:8000
