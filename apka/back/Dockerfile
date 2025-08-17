FROM python:3.13.7-trixie

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY main.py .

CMD [ "fastapi", "run", "app/main.py", "--port", "8000" ]
