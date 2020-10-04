#!/bin/bash
# This does not run when the container is started with an initialized data dir
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --set=PG_USER="$POSTGRES_DB_USER" --set=PG_PWD="$POSTGRES_DB_PASSWORD" --set=DB_NAME="$POSTGRES_DB_NAME" <<-EOSQL
    CREATE USER :PG_USER WITH CREATEDB PASSWORD :'PG_PWD';
    CREATE DATABASE :DB_NAME;
    GRANT ALL PRIVILEGES ON DATABASE :DB_NAME TO :PG_USER;
EOSQL
