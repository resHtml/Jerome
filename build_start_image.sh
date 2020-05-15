#!/bin/bash
docker kill rp static1 static2 express1 express2
docker rm `docker ps -qa` 
docker build -t res/apache_rp ./apache-reverse-proxy 
docker build -t res/apache_static ./apache-php    
docker build -t res/express ./express-images

docker run -d --name static1 res/apache_static
export STATIC_APP1=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' static1)":80"
echo "ip_static1: $STATIC_APP1"

docker run -d --name static2 res/apache_static
export STATIC_APP2=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' static2)":80"
echo "ip_static2: $STATIC_APP2"

docker run -d --name express1 res/express
export DYNAMIC_APP1=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' express1)":3000"
echo "ip_dynamic1 :$DYNAMIC_APP1"

docker run -d --name express2 res/express
export DYNAMIC_APP2=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' express2)":3000"
echo "ip_dynamic2 :$DYNAMIC_APP2"

docker run -d -e STATIC_APP1 -e STATIC_APP2 -e DYNAMIC_APP1 -e DYNAMIC_APP2 -p 8080:80 --name rp res/apache_rp 

