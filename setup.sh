# Check if Docker is running, if not exit the script
checkDocker() {
    if ! docker info >/dev/null 2>&1; then
        echo "Error: Docker is not running. Please start Docker first."
        exit 1
    fi
    echo "Docker is running!"
}

# Downloads MongoDB's image and creates the container exposing the 27017 port.
downloadAndCreateMongoContainer() {
    echo "Downloading MongoDB image..."
    docker pull mongo

    echo "Creating MongoDB container..."
    docker run --name mongodb -d -p 27017:27017 mongo
}

# Creates a Docker network and adds the Airflow and MongoDB containers.
setupDockerNetwork() {
    docker network create flowviz-docker-network

    docker network connect flowviz-docker-network mongodb && \
    for airflowContainer in $(docker ps --format {{.Names}} | grep "airflow-"); \
    do \
        docker network connect flowviz-docker-network $airflowContainer; \
    done

    docker inspect -f '{{with index .NetworkSettings.Networks "flowviz-network-docker"}}{{.IPAddress}}{{end}}' mongodb
}

# Copying default .env files, if user-defined .env files do not exist in server and client folders.
copyDefaultEnvFiles() {
    if [ ! -f ./.env ]; then
        cp .defaults/server/.env .
    fi

    if [ ! -f ./client/.env ]; then
        cp .defaults/client/.env client/
    fi
}

setupFlowviz() {
    echo "Setting up environment files..."
    copyDefaultEnvFiles

    echo "Running npm install..."
    npm run setup # Installs the dependencies with npm install
}

echo "Checking Docker..."
checkDocker

echo "Setting up MongoDB..."
downloadAndCreateMongoContainer

echo "Setting up Docker network..."
setupDockerNetwork

echo "Setting up Flowviz..."
setupFlowviz

echo "Setup completed!"