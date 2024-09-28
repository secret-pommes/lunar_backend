#!/bin/bash

ENTRY_FILE="server.ts"
SRC_DIR="src"

start_process() {
    echo "Starting ts-node..."
    if cd $SRC_DIR; then
        npm run prod
        cd - > /dev/null
    else
        echo "Error: Unable to navigate to $SRC_DIR. Exiting..."
        exit 1
    fi
}

terminate() {
    echo "Termination signal received. Exiting..."
    exit 0
}

trap terminate SIGTERM SIGINT

while true
do
    start_process
    echo "ts-node process exited with status $?. Restarting in 1 second..."
    sleep 1
done
