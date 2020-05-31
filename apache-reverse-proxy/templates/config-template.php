<?php
   $ipStatic1  = getenv('STATIC_APP1');
   $ipStatic2  = getenv('STATIC_APP2');   
   $ipDynamic1  = getenv('DYNAMIC_APP1');
   $ipDynamic2  = getenv('DYNAMIC_APP2');
?>

<VirtualHost *:80>
	ServerName demo.res.ch
	
	Header add Set-Cookie "ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/" env=BALANCER_ROUTE_CHANGED
	<Proxy 'balancer://static'>
		BalancerMember 'http://<?php print "$ipStatic1"?>' route=1
		BalancerMember 'http://<?php print "$ipStatic2"?>' route=2
		ProxySet stickysession=ROUTEID
	</Proxy>
	
	<Proxy 'balancer://dynamic'>
		BalancerMember 'http://<?php print "$ipDynamic1"?>' route=1
		BalancerMember 'http://<?php print "$ipDynamic2"?>' route=2
	</Proxy>
	
	<Location '/balancer-manager'>
		ProxyPass !
		
		SetHandler balancer-manager
		# Require host demo.res.ch
		# Order Deny,Allow
		# Allow from all
  	</Location>

	ProxyPass '/api/dynamic/' 'balancer://dynamic/api/dynamic/'
	ProxyPassReverse '/api/dynamic/' 'balancer://dynamic/api/dynamic/'

	ProxyPass '/api/docker/' 'balancer://dynamic/api/docker/'
	ProxyPassReverse '/api/docker/' 'balancer://dynamic/api/docker/'
 
	ProxyPass '/' 'balancer://static/'
	ProxyPassReverse '/' 'balancer://static/'
 

</VirtualHost>
