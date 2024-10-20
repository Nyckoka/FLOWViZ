#!/bin/bash

# Stops and removes Airflow containers and cleans up volumes
cleanupAirflow() {
    cd airflow/ && docker compose down -v
    rm -f .env
    cd ..
}

# Stops and removes MongoDB container
cleanupMongo() {
    docker stop mongodb
    docker rm mongodb
}

# Removes the Docker network
cleanupNetwork() {
    docker network rm flowviz-docker-network
}

# Cleans up node_modules and environment files
cleanupFlowviz() {
    # rm -rf node_modules
    # rm -rf client/node_modules
    rm -f .env
    rm -f client/.env
}

echo "Cleaning up Airflow..."
cleanupAirflow

echo "Cleaning up MongoDB..."
cleanupMongo

echo "Cleaning up Docker network..."
cleanupNetwork

echo "Cleaning up Flowviz files..."
cleanupFlowviz

echo "Cleanup completed!"