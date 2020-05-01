#!/bin/bash

docker build -t my-php-app .
docker run -d -p 9090:80 --name my-running-app my-php-app
