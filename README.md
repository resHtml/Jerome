# Teaching-HEIGVD-RES-2020-Labo-HTTPInfra

- Quentin Saucy
- Jérôme Arn

## Step 1: Static HTTP server with apache httpd

Le but de cette étape est de faire, à l'aide d'une image docker apache 7.2, un site qui affiche un contenu statique. Dans le docker file on indique qu'on prend une image php avec apache httpd par défaut. On indique que dans cette image on veut copier le contenu du répertoire **/src** dans **/var/www/html**. Ce répertoire contient notre page web par défaut de bootstrap. lors du lancement de du container, on effectue une redirection de sur le port **9090**. 

```sh
# content of Dockerfil
# FROM php:7.2-apache
# COPY src/ /var/www/html/
docker build -t my-php-app .
docker run -d -p 9090:80 --name my-running-app my-php-app
docker inspect my-running-app
# http://localhost:9090/
```

```sh
docker exec -it my-running-app /bin/bash
echo "coucou" >index.html
# http://localhost:9090/
```

* Le fichier de configuration se trouve dans  /etc/apache2/sites-available  **000-default.conf** pour changer la racine. Et dans var il y a la page web statique **index.html**. 

![](/home/jerome/HEIG/Labo/RES/Teaching-HEIGVD-RES-2020-Labo-HTTPInfra/img/task1.png)

## Step 2: Dynamic HTTP server with express.js

### Acceptance criteria

* You can do a demo, where you build the image, run a container and access content from a browser.
* You generate dynamic, random content and return a JSON payload to the client.
* You don't have to use express.js; if you want, you can use another JavaScript web framework or event another language.


## Step 3: Reverse proxy with apache (static configuration)


### Acceptance criteria

* You can do a demo, where you start from an "empty" Docker environment (no container running) and where you start 3 containers: static server, dynamic server and reverse proxy; in the demo, you prove that the routing is done correctly by the reverse proxy.

* You can explain and prove that the static and dynamic servers cannot be reached directly (reverse proxy is a single entry point in the infra). 

* You are able to explain why the static configuration is fragile and needs to be improved.

  Because the IP address are hardcoded in the reverse proxy. and they can change when we do a new startup.


### configuration 

In the reverse proxy we create a configuration file for our reverse proxy for the static and dynamique page. We can find the configuration file in `/etc/apache2/sites-available`. 

```sh
a2enmod proxy
a2enmod proxy_http
a2ensite 001-*
service apache2 reload
service apache2 restart
```




##  Step 4: AJAX requests with JQuery

### Acceptance criteria

* You can do a complete, end-to-end demonstration: the web page is dynamically updated every few seconds (with the data coming from the dynamic backend).

* You are able to prove that AJAX requests are sent by the browser and you can show the content of th responses.

  Network part of browser inspect page 

* You are able to explain why your demo would not work without a reverse proxy (because of a security restriction).

  because it's the reverse proxy that route the request from the browser to a dynamic or static 


To execute some javascript in index.html, we must include it at the end of the file with the path of the javascript.The script is build as follow: 

```js
$(function(){
    // declare function
    	// use module getJSON
    // function call 
    // setInterval(function, MS); for a call every MS
});
```



## Step 5: Dynamic reverse proxy configuration

### Acceptance criteria

```sh
# add environnement variable to docker image 
 docker run -e HELLO=world -e RES=heig -it res/apache_rp /bin/bash
# overwrite a script call by docker file in the image to use environnement variable 
```

The goal is to :

1. run the two docker for static and dynamic
2. get there adress by using a script and put it a environnement variable 
3. run the php script and redirect the output in config file 

* You have found a way to replace the static configuration of the reverse proxy (hard-coded IP adresses) with a dynamic configuration.
* You may use the approach presented in the webcast (environment variables and PHP script executed when the reverse proxy container is started), or you may use another approach. The requirement is that you should not have to rebuild the reverse proxy Docker image when the IP addresses of the servers change.
* You are able to do an end-to-end demo with a well-prepared scenario. Make sure that you can demonstrate that everything works fine when the IP addresses change!
* You are able to explain how you have implemented the solution and walk us through the configuration and the code.

## Additional steps to get extra points on top of the "base" grade

### Load balancing: multiple server nodes (0.5pt)

* You show that you can have **multiple static server nodes** and **multiple dynamic server nodes**. 
* You prove that the **load balancer** can distribute HTTP requests between these nodes.

To execute the load balancing byrequest on apache. To do that, i have enable the following modules **lbmethod_byrequests and proxy_balancer**. The infrastructure will be made of 2 statics servers and 2 dynamics servers. First with my building script I run these 4 servers and i catch the 4 Ip adress in environnement variables. And I give these varaiables when i run the reverse proxy container. 

In the template for configuration of the reverse proxy, I have made the modifications that was given on https://httpd.apache.org/docs/2.4/mod/mod_proxy_balancer.html . 

### Load balancing: round-robin vs sticky sessions (0.5 pt)

* You do a setup to demonstrate the notion of sticky session.
* You prove that your load balancer can distribute HTTP requests in a round-robin fashion to the dynamic server nodes (because there is no state).
* You prove that your load balancer can handle sticky sessions when forwarding HTTP requests to the static server nodes.

### Management UI (0.5 pt)

* You develop a web app (e.g. with express.js) that administrators can use to monitor and update your web infrastructure.
* You find a way to control your Docker environment (list containers, start/stop containers, etc.) from the web app. For instance, you use the Dockerode npm module (or another Docker client library, in any of the supported languages).