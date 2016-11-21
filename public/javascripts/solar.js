var oauthwindow
var pagename ='trace';
function websockstart(){
    ws = new ReconnectingWebSocket(wsUri);
    ws.onopen = function(evt){
        console.log("websocket connected")
        websocketsend('setwebpage',{pagename:pagename});



    };
    ws.onmessage = function(evt) {
        var x = JSON.parse(evt.data);
        switch(x.object){

            case "things":

                things = x.data;
            //new things object - do something?
            //  location.reload();
                break;
              // websock.send(JSON.stringify({object:"buffer",data:{buffer: buffer[o.stripname],stripname:o.stripname}}),'lightstrip');
            case "displaytext":
                document.getElementById('displaytext').innerHTML=x.data.text1;
                break;
            case "displayvalue":
                document.getElementById('displayvalue').innerHTML=x.data.value;

                break;
            case "displayleds":
                console.log('leds:'+x.data.value);
                break;
            case "xantrex":
                console.log('leds:'+x.data.value);
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


function sendkey(key){
    websocketsend('trace', {
        instruction: 'sendkey',key:key});
}