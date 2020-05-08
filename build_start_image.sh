#!/bin/bash
docker build -t res/apache_rp ./apache-reverse-proxy 
docker build -t res/apache_static ./docker-images    
docker build -t res/express ./express-images
docker run -d res/apache_static
docker run -d res/apache_static
docker run -d -p 8080:80 res/apache_rp 

