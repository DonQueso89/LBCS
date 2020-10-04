#!/bin/bash

poetry run /srv/app/manage.py migrate
poetry run /srv/app/manage.py createsuperuser --noinput
poetry run /srv/app/manage.py runserver 0.0.0.0:8080    
