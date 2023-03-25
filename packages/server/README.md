```sh
pipenv run flask run

pipenv run flask db init
pipenv run flask db migrate
pipenv run flask db upgrade

pipenv run flask create-clients # create OAuth2 clients
```

- https://uwsgi-docs.readthedocs.io/en/latest/WSGIquickstart.html#deploying-flask
- https://smirnov-am.github.io/running-flask-in-production-with-docker/
- https://gabimelo.medium.com/developing-a-flask-api-in-a-docker-container-with-uwsgi-and-nginx-e089e43ed90e


## Code Inspiration

- https://github.com/mahmoud/awesome-python-applications
- https://github.com/benadida/helios-server/blob/master/helios_auth/auth_systems/password.py
- 