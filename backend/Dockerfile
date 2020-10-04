FROM python:3.8-slim
RUN apt -y update && apt -y install libpq-dev curl
RUN pip install poetry
ENV PATH="/root/.poetry/bin:${PATH}"
COPY ./poetry.lock ./pyproject.toml /code/
WORKDIR /code
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

WORKDIR /srv/app
ENTRYPOINT ["/bin/bash", "/srv/app/.boot.sh"]
