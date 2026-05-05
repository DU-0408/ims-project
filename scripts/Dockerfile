FROM python:3.12-slim

WORKDIR /app
COPY seed_events.py .
RUN pip install httpx

CMD ["python", "seed_events.py"]