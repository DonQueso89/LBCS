FROM python:3.9-slim
RUN pip install -U pip
RUN apt update
RUN apt install -y python3-setuptools
RUN mkdir -p /srv/app
WORKDIR /srv/app
# repo will be mounted here so we can install it in editable mode
VOLUME /srv/app
EXPOSE 8888

ENTRYPOINT ["/bin/bash", "/srv/app/.boot.sh"]
