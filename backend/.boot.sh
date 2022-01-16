#!/bin/bash
pip install -r requirements.txt
python /srv/app/manage.py migrate
python /srv/app/manage.py createsuperuser --noinput
python /srv/app/manage.py runserver 0.0.0.0:8080    
