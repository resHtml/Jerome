<?php
   $ipStatic1  = getenv('STATIC_APP1');
   $ipStatic2  = getenv('STATIC_APP2');   
   $ipDynamic1  = getenv('DYNAMIC_APP1');
   $ipDynamic2  = getenv('DYNAMIC_APP2');
?>

<VirtualHost *:80>
	ServerName demo.res.ch
	
	<Proxy 'balancer://static'>
		BalancerMember 'http://<?php print "$ipStatic1"?>' route=1
		BalancerMember 'http://<?php print "$ipStatic2"?>' route=2
	</Proxy>
	
	<Proxy 'balancer://dynamic'>
		BalancerMember 'http://<?php print "$ipDynamic1"?>' route=1
		BalancerMember 'http://<?php print "$ipDynamic2"?>' route=2
	</Proxy>
	
	<Location '/balancer-manager'>
		SetHandler balancer-manager
		Require host demo.res.ch
	</Location>

	ProxyPass '/api/dynamic/' 'balancer://dynamic/api/dynamic/'
	ProxyPassReverse '/api/dynamic/' 'balancer://dynamic/api/dynamic/'

	ProxyPass '/' 'balancer://static/'
	ProxyPassReverse '/' 'balancer://static/'
 
</VirtualHost>
