# Teaching-HEIGVD-RES-2020-Labo-HTTPInfra

>- Quentin Saucy
>- Jérôme Arn

## Step 1: Static HTTP server with apache httpd

Le but de cette étape est de faire, à l'aide d'une image docker apache 7.2, un site qui affiche un contenu statique. Dans le "dockerfile" on indique qu'on prend une image php avec apache httpd par défaut. On indique que dans cette image on veut copier le contenu du répertoire **/src** dans **/var/www/html**. Ce répertoire contient notre page web par défaut de bootstrap. lors du lancement du container, on effectue une redirection sur le port **9090**. 

```sh
# content of Dockerfile
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

![](./img/task1.png)

## Step 2: Dynamic HTTP server with express.js

Le but de cette partie est de générer dynamiquement toute les secondes des valeurs aléatoires. Pour cela nous avons utilisé **express.js** car comme nous étions novice dans le domaine, nous avons préféré rester avec l'outil montrer pas le professeur. Nous n'avons pas eut à changer beaucoup la configuration montrée dans les webcast. Nous avons toutefois généré un contenu différent à celui présenté dans les vidéos. Nous avons donc utilisé **chancejs** pour générer des pseudos informations docker. Nous avons créé un hash , avec le nombre jours depuis la création de ce docker, et son nom aléatoire. Pour cela nous avons utilisé 3 champs différents offert par **chancejs**:
* hash: génère un hash de 12 caractères
* entier : génère un nombre entre 1 et 30 et on ajoute le texte " days ago"
* mot : génère 2 mots de 2 syllabes connecté par un '-'

![](./img/task2.png)

## Step 3: Reverse proxy with apache (static configuration)

Dans cette étape, nous devions mettre en place un reverse proxy pour la partie statique et dynamique. Nous avons utilisé la même image que celle du serveur statique. Travaillant sous linux, les images dockers fonctionnent directement sur l'OS et non pas dans une machine virtuel,  le reverse proxy n'est donc pas le seul point d'entrée pour nos containers. Cela vient du fait que notre système fait office d'hôte pour les containers et il n'a pas besoin d'une machine virtuelle. Par contre si on installait notre configuration sur un raspberry pi se trouvant sur notre réseau domestique et qu'on tentait d'y accéder depuis un ordinateur se trouvant sur le même réseau, ce serait le seul point d'entrée. 
Pour faire fonctionner notre RP, nous avons activé les modules proxy et proxy_http. Puis nous avons activé la configuration que nous avons créée. Le "problème" de cette configuration est qu'il faut s'assurer que  les adresses codées en dures sont toujours pareilles. 

* You can do a demo, where you start from an "empty" Docker environment (no container running) and where you start 3 containers: static server, dynamic server and reverse proxy; in the demo, you prove that the routing is done correctly by the reverse proxy.

* You are able to explain why the static configuration is fragile and needs to be improved.

  Because the IP address are hardcoded in the reverse proxy. and they can change when we do a new startup.


### configuration 

Dans le Rp nous avons créé une configuration pour redirigé l'utilisateur en fonction du chemin qu'il entre dans le navigateur. On peut trouver cette configuration dans `/etc/apache2/sites-available`. 

```sh
a2enmod proxy
a2enmod proxy_http
a2ensite 001-*
service apache2 reload
service apache2 restart
```



##  Step 4: AJAX requests with JQuery

Dans cette partie du laboratoire, nous avons mis en place avec script js dans la page **index.html** qui permet de mettre à jour toutes les secondes une partie de cette dernière. En l'occurence, nous avons choisi l'entête de la page dans notre cas. Sans le RP, cette configuration ne serait pas possible parce que c'est le RP qui route la requête du browser vers le bon serveur. 

Dans la partie netword de la page internet on peut voire que c'est bien le browser qui envoie les différentes requêtes. 

![](/home/jerome/HEIG/Labo/RES/Teaching-HEIGVD-RES-2020-Labo-HTTPInfra/img/task4.png)

```js
// à la fin du fichier index.html 
<script src="vendor/dockers.js"></script>  

// le script appelé à la fin de la page index.html
$(function(){
	console.log("loading dockers");

	function loadDockers(){
		$.getJSON("/api/dynamic/",function(dockers){
			console.log(dockers);
			var message = "Nobody is here";
			if(dockers.length > 0){
				message = dockers[0].id + " " + dockers[0].created+" "+dockers[0].dockername;
			}
			$(".navbar-brand").text(message);
		});
	};
	loadDockers();
	setInterval(loadDockers, 2000);
});
```



## Step 5: Dynamic reverse proxy configuration

Nous avons repris notre configuration existante de RP et nous  y avons fait les changements suivant :

- le fichier de configuration sera généré par un script php 
- Nous utilisons des variables d'environement pour stocker les adresses et ainsi les passés en argument de la commande `docker run` 
- Modifié le script de lancement des docker. 

Puis dans le script  **apache2-foreground** nous créons dynamiquement la configuration du serveur avec les adresses passées en paramètres avec les variables d'environnement. Dans le script php, nous récupérons les variables d'environnement transmises par le script ci-desous, pour produire un fichier de configuration dynamique pour le RP.  Dans le script suivant nous reconstruisons les images à chaque fois dans le cas où nous aurions fait une modification, ceci afin de s'éviter des surprises lors de nos tests. 

```sh
docker build -t res/apache_rp ./apache-reverse-proxy 
docker build -t res/apache_static-s1 ./apache-static-S1   
docker build -t res/apache_static-s2 ./apache-static-S2   
docker build --no-cache -t res/express ./express-images

docker run -d --name static1 res/apache_static-s1
export STATIC_APP1=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' static1)":80"
echo "ip_static1: $STATIC_APP1"

docker run -d --name static2 res/apache_static-s2
export STATIC_APP2=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' static2)":80"
echo "ip_static2: $STATIC_APP2"

docker run -v /var/run/docker.sock:/var/run/docker.sock -d --name express1 res/express
export DYNAMIC_APP1=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' express1)":3000"
echo "ip_dynamic1 :$DYNAMIC_APP1"

docker run -v /var/run/docker.sock:/var/run/docker.sock -d --name express2 res/express
export DYNAMIC_APP2=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' express2)":3000"
echo "ip_dynamic2 :$DYNAMIC_APP2"
```

## Load balancing: multiple server nodes 

Pour exécuter le RP en mode load balancingn nous avons activé les modules **lbmethod_byrequests, status and proxy_balancer**. L'infrastructure de test se constituera de 2 noeuds dynamiques et de 2 noeuds statiques. Nous avons ajouté l'option qui permet de montré la charge des serveurs avec le module status. Cette page est accessible via l'onglet **Load-manager**.  Dans le fichier de config, nous avons avons modifié comme dans le script ci-dessous selon les instructions du site https://httpd.apache.org/docs/2.4/mod/mod_proxy_balancer.htm. 

```sh
	# ajout des deux membres dynamiques
	<Proxy 'balancer://static'>
		BalancerMember 'http://<?php print "$ipStatic1"?>' route=1
		BalancerMember 'http://<?php print "$ipStatic2"?>' route=2
	</Proxy>
	
	# ajout des deux membres statiques
	<Proxy 'balancer://dynamic'>
		BalancerMember 'http://<?php print "$ipDynamic1"?>' route=1
		BalancerMember 'http://<?php print "$ipDynamic2"?>' route=2
	</Proxy>
	
	# configuration de la page load balancer. 
    <Location '/balancer-manager'>
        ProxyPass !

        SetHandler balancer-manager
        # Require host demo.res.ch
        # Order Deny,Allow
        # Allow from all 
    </Location>
```

On peut voir ici que nous avons accès au deux serveurs statiques. 

![](/home/jerome/HEIG/Labo/RES/Teaching-HEIGVD-RES-2020-Labo-HTTPInfra/img/task6.png)

## Load balancing:  sticky sessions

Le principe de régulateur de charge avec **sticky session** consiste à rediriger un client toujours vers le même serveur. Ce qui fait que si on va sur le site **demo.res.ch:8080** avec notre navigateur et qu'on est servit par le serveur 1, cela restera "notre serveur". Ce qui n'arriverait pas dans un mode round robin ou chaque serveur serveur appelé tour à tour. Pour faire cela nous avons ajouté, comme pour l'exemple de https://httpd.apache.org/docs/2.4/mod/mod_proxy_balancer.html, le module headers qui permet de modifier les entêtes des requêtes et réponses http. De plus on indique quelle route doit prendre un client avec la session courante. 

Pour tester nous avons utiliser le navigateur firefox de manière normale, qui s'est vu attribué le serveur 1, et firefox en mode privé,qui s'est vu attribué le serveur 2. On peut actualiser la page autant de fois que l'on désire on va rester sur le même serveur. 

```sh
	Header add Set-Cookie "ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
	<Proxy 'balancer://static'>
		BalancerMember 'http://<?php print "$ipStatic1"?>' route=1
		BalancerMember 'http://<?php print "$ipStatic2"?>' route=2
		ProxySet stickysession=ROUTEID
	</Proxy>
```

 

## Management UI 

* You develop a web app (e.g. with express.js) that administrators can use to monitor and update your web infrastructure.
* You find a way to control your Docker environment (list containers, start/stop containers, etc.) from the web app. For instance, you use the Dockerode npm module (or another Docker client library, in any of the supported languages).
