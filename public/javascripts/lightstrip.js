var oauthwindow
var pagename ='lightstrip';
function websockstart(){
    ws = new ReconnectingWebSocket(wsUri);
    ws.onopen = function(evt){
        console.log("websocket connected")
        websocketsend('setwebpage',{pagename:pagename});
        drawstrip('strip1',5);
        drawstrip('strip2',50);

    };
    ws.onmessage = function(evt) {

        var x = JSON.parse(evt.data);
        switch(x.object){

            case "things":

                things = x.data;
            //new things object - do something?
            //  location.reload();
                break;
            case  "statusupdate":
                var statusupdates = document.getElementById("statusupdates")
                statusupdates.value = x.data.message+'\n'+statusupdates.value;
                break;

            default:
                alert(x.object);


        }


    };

}
function websocketsend(type,data){

    var sendobj = {};
    sendobj.type = type;
    sendobj.data = data;
    ws.send(JSON.stringify(sendobj));

}

function drawstrip(id,leds){
    var canvas = document.createElement('canvas');
    canvas.id     = id;
    canvas.style =    "display: block";

    canvas.width  = (leds*25)-5;
    canvas.height = 26;
    //canvas.style.position = "absolute";
    canvas.style.border   = "1px solid";
    document.getElementById('strips').appendChild(canvas); // adds the canvas to #someBox
    var buf = []
   for (i = 0; i <leds*3; i++) {buf[i]= 0}
    writestrip(id,buf)

}
function writestrip(id,buffer){
    var leds = buffer.length/3;
    var ctx=document.getElementById(id).getContext("2d");
    for (i = 0; i <leds; i++)
    {
        ctx.fillStyle = 'rgb('+buffer[i*3]+','+ buffer[(i*3)+1]+','+ buffer[(i*3)+2]+')';
        ctx.fillRect(i*25, 3,20, 20);
    }
}