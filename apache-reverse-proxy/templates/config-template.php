<?php
   $ipStatic1  = getenv('STATIC_APP1');
   $ipDynamic1  = getenv('DYNAMIC_APP1');
?>

<VirtualHost *:80>
	ServerName demo.res.ch

	ProxyPass '/api/dynamic/' 'http://<?php print "$ipDynamic1"?>/api/dynamic/'
	ProxyPassReverse '/api/dynamic/' 'http://<?php print "$ipDynamic1"?>/api/dynamic/'

	ProxyPass '/' 'http://<?php print "$ipStatic1"?>/'
	ProxyPassReverse '/' 'http://<?php print "$ipStatic1"?>/'
 
</VirtualHost>
