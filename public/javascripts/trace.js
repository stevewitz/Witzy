var oauthwindow
var pagename ='trace';
function websockstart(){
    ws = new ReconnectingWebSocket(wsUri);
    ws.onopen = function(evt){
        console.log("websocket connected")
        websocketsend('setwebpage',{pagename:pagename});



    };
    ws.onmessage = function(evt) {
       console.log('websocket messge')
        var x = JSON.parse(evt.data);
        switch(x.object){

            case "things":

                things = x.data;
            //new things object - do something?
            //  location.reload();
                break;
              // websock.send(JSON.stringify({object:"buffer",data:{buffer: buffer[o.stripname],stripname:o.stripname}}),'lightstrip');
            case "displaytext":
                console.log(x.data.line1);
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


