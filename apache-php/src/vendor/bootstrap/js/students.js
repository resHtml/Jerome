$(function(){
	console.log("loading students");

	function loadStudents(){
		$.getJSON("/test/",function(students){
			console.log(students);
			var message = "Nobody is here";
			if(students.length > 0){
				message = students[0].firstName + " " + students[0].lastName;
			}
			$(".navbar-brand").text(message);
		});
	};
	loadStudents();
	setInterval(loadStudents, 2000);
});
