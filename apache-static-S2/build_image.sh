#!/bin/bash

docker build -t res/apache_php .
docker run -d -p 9090:80 res/apache_php
