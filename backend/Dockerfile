FROM python:3.9-slim
RUN pip install -U pip
RUN apt update
RUN apt install -y build-essential python3-setuptools
RUN mkdir -p /srv/app
WORKDIR /srv/app
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
# repo will be mounted here
VOLUME /srv/app
EXPOSE 9999

ENTRYPOINT ["/bin/bash", "/srv/app/.boot.sh"]
