FROM python:3.10-slim

WORKDIR /app

COPY apps/compiler/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/compiler/ /app/

EXPOSE 8001

CMD ["python", "runner.py"]
