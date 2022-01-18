#!/bin/bash
# deps have been installed into the image but we run this
# so that we dont need to rebuild it if we add a dependency
# during development
pip install -r requirements.txt
python /srv/app/manage.py migrate
python /srv/app/manage.py createsuperuser --noinput
python /srv/app/manage.py runserver 0.0.0.0:8080    
