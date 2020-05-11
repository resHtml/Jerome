#!/bin/bash
docker build -t res/apache_rp ./apache-reverse-proxy 
docker build -t res/apache_static ./apache-php    
docker build -t res/express ./express-images
docker run -d --name static res/apache_static
docker run -d --name express res/express
docker run -d -p 8080:80 --name rp res/apache_rp 

