
FROM python:3.12.5
WORKDIR /app
COPY backend /app/backend
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "src/main.py"]