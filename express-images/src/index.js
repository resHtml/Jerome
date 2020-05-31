var Chance = require('chance');
var chance = new Chance();
var express = require('express');

var Docker = require('dockerode');

var app = express();

var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
app.get ('/api/dynamic', function(req,res){
	res.send(generateDockerNames());
});
app.get('/api/docker/', function (req, res) {
	var toSend=[];

	docker.listContainers({all: true},function (err, containers) {
		
		for (var i = 0, len = containers.length;i<len;i++ ){
			
			toSend.push(oneContainer(containers[i]));

		}

		res.json(toSend);
	
		  });
  });


app.get('/api/docker/:uid',function(req,res){
	container = docker.getContainer(req.params.uid);
	container.inspect(function (err, data) {
		if(data.State.Running){
			container.stop().then(function(){res.send("")})
		}else {
			container.start()
				.then(function(){res.send("")})
		}
	});
});
app.get ('/', function(req,res){
	res.send("hello RES\n");
});

app.listen (3000, function(){
	console.log("accepting request on port 3000");
});

function generateDockerNames(){
	var numberOfDockers = chance.integer({
		min: 0,
		max: 10	
	});
	var dockers = [];
	for(var i = 0; i < numberOfDockers; i++){
		var containerid = chance.hash({length :12});
		var created = chance.integer({
			min: 1,
			max: 30
		});
		created += " days ago";
		var name = chance.word({syllables:2})+"-"+ chance.word({syllables:2})
		dockers.push({
			id:containerid,
			created:created,
			dockername:name
		});
	};
	return dockers;
}

/**
 *
 * @param container hash
 * @returns {{ip: null, name: *, id: *, state: *}}
 */
  function oneContainer(container){
  	ip = null
  	if(container.State==="running")
		ip = container.NetworkSettings.Networks.bridge.IPAddress;
  	result = {name : container.Names[0],id:container.Id,state : container.State, ip:ip}

  	return result
  }

