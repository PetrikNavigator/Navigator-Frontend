### Building and running your application

First create the network for backend and proxy:
```sh
docker network create -d bridge backend-net
```

To check if the network exists run:
```sh
docker network ls
```

Build the application by running this command from the project root:
```sh
docker build -f docker/Dockerfile -t navigator-admin .
```
Than start the container by running:
```sh
docker compose -f docker/compose.yaml up
```

Note: the Compose project name is pinned in `docker/compose.yaml` via `name: navigator-admin`, so it won't be derived from the folder name. You can still override it per-run with `docker compose -p <project> ...` or `COMPOSE_PROJECT_NAME=<project> docker compose ...`.

The application will be available at http://127.0.0.1:8001.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)