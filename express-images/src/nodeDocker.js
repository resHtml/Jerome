var Docker = require('dockerode');
const express = require('express');
const app = express();
var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var docker = new Docker({socketPath: socket });
app.get('/api/docker/', function (req, res) {
	res.append('Access-Control-Allow-Origin', '*')
	var toSend=[];

	docker.listContainers({all: true},function (err, containers) {
		for (var i = 0, len = containers.length;i<len;i++ ){
			
			toSend.push(oneContainer(containers[i]))

		}

		res.json(toSend);
	
		  });
  });

app.get('/api/docker/:uid',function(req,res){
	res.header('Access-Control-Allow-Origin', '*')
	container = docker.getContainer(req.params.uid)
	container.inspect(function (err, data) {
		if(data.State.Running){
			container.stop().then(function(){res.send("")})
		}else {
			container.start()
				.then(function(){res.send("")})
		}
	});
});


  app.listen(3000, function () {
  console.log('Express res-lab !')
  });
  
  function oneContainer(container){
  	ip = null
  	if(container.State==="running")
		ip = container.NetworkSettings.Networks.bridge.IPAddress
  	result = {name : container.Names[0],id:container.Id,state : container.State, ip:ip}

  	return result
  }

  function test(){
  	console.log("started")
  }