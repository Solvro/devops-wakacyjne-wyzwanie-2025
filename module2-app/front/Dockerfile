FROM python:3.9-slim

WORKDIR /app

COPY templates /app/templates
COPY static /app/static
RUN pip install flask

CMD ["python", "-m", "http.server", "5000"]