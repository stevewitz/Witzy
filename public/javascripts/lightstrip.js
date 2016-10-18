var oauthwindow
var pagename ='lightstrip';
function websockstart(){
    ws = new ReconnectingWebSocket(wsUri);
    ws.onopen = function(evt){
        console.log("websocket connected")
        websocketsend('setwebpage',{pagename:pagename});

        drawstrips();


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
            case "buffer":
              //  console.log('leds:'+x.data.leds)
                //for some reason the buff comes over as on object
              //  var obuffer = new Uint32Array(x.data.leds);
              //   for(var i = 0; i < x.data.leds; ++i){
              //       obuffer[i] = x.data.buffer[i];
              //   }
              //
              //       writestrip(x.data.stripname,obuffer);
                writestrip(x.data.stripname,x.data.buffer);
                break;
               // websock.send(JSON.stringify({object:"buffer",data:{buffer: buffer[o.stripname],stripname:o.stripname}}),'lightstrip');

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

function drawstrips(){

    settings.hardware.rgbled.forEach(function(s){
        var canvas = document.createElement('canvas');
        canvas.id     = s.name;
        canvas.style =    "display: block";

        canvas.width  = (s.leds*25)-5;
        canvas.height = 26;
        //canvas.style.position = "absolute";
        canvas.style.border   = "1px solid";
        document.getElementById('strips').appendChild(canvas); // adds the canvas to #someBox



        }
    )

}

function writestrip(id,buffer){
    var ctx=document.getElementById(id).getContext("2d");
    var pad = "#000000";
    var out;
    var i = 0;
    while (true)
    {
        out = buffer[i].toString(16);
        ctx.fillStyle = pad.substring(0, pad.length - out.length) + out ;// this is super stupid
        ctx.fillRect(i*25, 3,20, 20);
        ++i;
        if (buffer[i] == undefined){break;}
    }
}

// function writestrip(id,buffer){
//     var leds = buffer.length;
//     console.log('leds'+leds)
//    // leds=10
//     var ctx=document.getElementById(id).getContext("2d");
//     var pad = "#000000";
//     var out;
//     for (i = 0; i <leds; i++)
//     {
//
//         out = buffer[i].toString(16);
//       // console.log(out)
//         ctx.fillStyle = pad.substring(0, pad.length - out.length) + out ;// this is super stupid
//
//         ctx.fillRect(i*25, 3,20, 20);
//     }
// }