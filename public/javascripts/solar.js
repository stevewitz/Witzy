var oauthwindow
var pagename ='solar';
function websockstart(){
    ws = new ReconnectingWebSocket(wsUri);
    ws.onopen = function(evt){
        console.log("websocket connected")
        websocketsend('setwebpage',{pagename:pagename});



    };
    ws.onmessage = function(evt) {
        var x = JSON.parse(evt.data);
        x.data.time = new Date().toLocaleTimeString();
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
                document.getElementById('swleds').value=JSON.stringify(x.data,null,1);

                break;
            case "xantrex":
                document.getElementById('xantrexdata').value=JSON.stringify(x.data,null,1);
                break;
            case "outback":
                 x.data.pvWatts = x.data.pvCurrent*x.data.pvVoltage;
                 x.data.chargeWatts = x.data.chargerCurrent*x.data.batteryVoltage;
               if (x.data.address == 'C'){
                   document.getElementById('outbackdata2').value=JSON.stringify(x.data,null,1);
               }
                if (x.data.address == 'B'){
                    document.getElementById('outbackdata').value=JSON.stringify(x.data,null,1);
                }
                break;
            case "swData":
                document.getElementById('swData').value=JSON.stringify(x.data,null,1);
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
    websocketsend('solar', {
        instruction: 'sendkey',key:key});
}
function menu4(){
    websocketsend('solar', {
        instruction: 'menu4'});

}