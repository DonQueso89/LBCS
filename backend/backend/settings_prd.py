from .settings import *
import os

# Configure the domain name using the environment variable
# that Azure automatically creates for us.
ALLOWED_HOSTS = ['.azurewebsites.net'] if 'WEBSITE_HOSTNAME' in os.environ else []


STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'  

# DBHOST is only the server name, not the full URL
hostname = os.environ['DBHOST']

# Configure Postgres database; the full username is username@servername,
# which we construct using the DBHOST value.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['DBNAME'],
        'HOST': hostname + ".postgres.database.azure.com",
        'USER': os.environ['DBUSER'],
        'PASSWORD': os.environ['DBPASS'],
        # were connecting to public ip of flexible server
        'OPTIONS': {'sslmode': 'require'},
    }
}
# Deployment checklist
SECRET_KEY = os.environ['SECRET_KEY']
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
DEBUG_PROPAGATE_EXCEPTIONS = True