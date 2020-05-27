$(function(){
	console.log("jquery load");
    function dockerMain(){
        $.getJSON("/api/docker/",function (containers){
            console.log(containers);
            var message =  '                  <thead>\n' +
                '                    <tr>\n' +
                '                      <th>Nom</th>\n' +
                '                      <th>IP</th>\n' +
                '                      <th>on/off</th>\n' +
                '                    </tr>\n' +
                '                  </thead>\n' +
                '\n' +
                '                  <tfoot>\n' +
                '                    <tr>\n' +
                '                      <th>Nom</th>\n' +
                '                      <th>IP</th>\n' +
                '                      <th>on/off</th>\n' +
                '                    </tr>\n' +
                '                  </tfoot>\n' +
                '\n' +
                '                  <tbody>\n'
            for (let container in containers) {
                let buttonValue = ""
                message +='<tr>'
                message+= '<td> '+  containers[container].name
                message += '</td>'
                message+= '<td> '
                if(containers[container].state === "running"){
                    buttonValue= "stop"

                    message +=  containers[container].ip

                }
                else buttonValue="start"
                message += '</td>'
                message += '<td>'

                message += '<a  id="' +containers[container].id+'" class="card p-2 px-3 w-100 list-group-item-action  button">  '

                message += buttonValue+'</a>'
                message +='</td>'
                message +='</tr>'

            }
            message += '                  </tbody>'
            $("#dataTable").html(message);
            $(".button").click(function(elem){
                str = "/api/docker/"+elem.target.id
		console.log(str)
                $.ajax({
                    url: str,
                    type: 'GET',
                    cache: false,
                    success: function(msg){

                        $(dockerMain())

                }
                });
                }
            )
        });
    };




    $(dockerMain())

});

