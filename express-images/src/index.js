var Chance = require('chance');
var chance = new Chance();
var express = require('express');

var Docker = require('dockerode');

var app = express();

var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});
//var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
//var docker = new Docker({socketPath: socket });
app.get ('/api/dynamic', function(req,res){
	res.send(generateStudents());
});
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
app.get ('/', function(req,res){
	res.send("hello RES\n");
});

app.listen (3000, function(){
	console.log("accepting request on port 3000");
});

function generateStudents(){
	var numberOfStudents = chance.integer({
		min: 0,
		max: 10	
	});
	console.log(numberOfStudents);
	var students = [];
	for(var i = 0; i < numberOfStudents; i++){
		var gender = chance.gender();
		var birthYear = chance.year({
			min: 1986,
			max: 1996
		});
		students.push({
			firstName: chance.first({
				gender: gender
			}),
			lastName: chance.last(),
			gender: gender,
			birthday: chance.birthday({
				year: birthYear
			})
		});
	};
	console.log(students);
	return students;
}










  
  function oneContainer(container){
  	ip = null
  	if(container.State==="running")
		ip = container.NetworkSettings.Networks.bridge.IPAddress
  	result = {name : container.Names[0],id:container.Id,state : container.State, ip:ip}

  	return result
  }

