# Setup
- run `docker-compose up` 
The above command starts the backend server for the LBSC client. This also automatically installs all the dependencies required for the repo.
- the django admin for the backend server should run at `127.0.0.1:9999/admin`
- to jump into the shell of the container use:
```bash
docker-compose exec backend bash
```

