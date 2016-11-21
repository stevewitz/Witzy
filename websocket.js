var debug = 1;
var console = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('blue','websocket ') + x + '\n');}}})();
/**
 * Created by todd on 1/22/14.
 */
websocket = {};
var request = require('request');

//Set up Web socket for a connection
//exports.start = function(wscallback,port){
    var WebSocketServer = require('ws').Server;

//Set up the web socket here..
    wss = new WebSocketServer({port: settings.options.websocket.listenport}, function(err,res){
        //  console.log(wss.url);
        if (err){
            console.log("Websocket error:"+err);
        }
        else
        {
            console.log("Websocket Server Listening on Port:"+settings.options.websocket.listenport);
        }
    });
    wss.on('connection', function(ws) {
        var i = 0;
        while (true)
        {
            if (!websocket[i]){
                break;
            }
            i++;
        }
        websocket[i]=ws;
        /************************************************/
        if (settings.options.websocket.showconnectioninfo){
            if (websocket[i]._socket.remoteAddress.substr(0,3) != '10.'
                && websocket[i]._socket.remoteAddress.substr(0,7) != '192.168'
                && websocket[i]._socket.remoteAddress.substr(0,7) != '127.0.0'
            )
            {
                // get info on id address
                request.get({
                    url: 'http://ipinfo.io/'+websocket[i]._socket.remoteAddress,
                },function(err,rslt){
                    console.log('Websocket Connected Id:'+i+" websocket ip Remoteaddress info:"
                        +ll.ansi('brightRed',JSON.parse(rslt.body).hostname+':'+ websocket[i]._socket.remoteAddress));
                });
            }else
            {
                console.log('Websocket Connected Id:'+i+" LocalAddress:"+websocket[i]._socket.remoteAddress);
            }
        websocket[i].pagename = '';
        }
        /************************************************/
        var thisId= i;
        ws.on('message', function(message) {
            //  console.log("message :"+message)
            var data = JSON.parse(message);
            if (!data){
                console.log('no data in websocket message from'+thisId);
                return;
            }
            wsData(data,thisId);

//            level451.wsDataIn(message,thisId);

            //  console.log('received: %s', message,thisId);
        });
        ws.on('close', function(ws){
            console.log('Websocket disconnected Id:'+thisId +'('+websocket[thisId].pagename +')');
            delete websocket[thisId];
        });
        ws.on('error', function(ws){
            console.log('Websocket Error Id:'+thisId);
            delete websocket[thisId];
        });
    });


exports.send = function(data,id,binary)
{
    // id passed as a webpage name - only send it to those webpages
    if (id && id.length > 2) {
        //   console.log('send to NAME:'+id)
        for (var i = 0; i < 10; i++) {
            if (websocket[i] && websocket[i].pagename == id) {
                websocket[i].send(data);
            }
        }
    }else
    {
        if (id && id > -1 && websocket[id])
        // an id was passed - just send it to that websocket
        {
            //console.log('send to ONE:'+id)
            websocket[id].send(data,binary);
        } else
        {
            //  console.log('send to ALL:'+id)

            // no id passed - send it to all connected websockets
            //someday fix this so it tracks the number of connections
            for (var i=0; i < 10; i++)
            {
                if (websocket[i])
                {
                    websocket[i].send(data,binary);
                    //console.info("websocket sending to client "+i);
                }
            }
        }
    }
};
//     exports.send = function(data,id)
//     {
//         if (id && id.length > 2) {
//            for (var i = 0; i < 10; i++) {
//                 if (websocket[id] && websocket[id].pagename == id) {
//                     id = i;
//                     break;
//                 }
//             }
//         }
//
//
//             if (id && id > -1 && websocket[id])
//         {
//             websocket[id].send(data);
//         } else
//         {
// //            console.log('keys'+ Object.keys(websocket));
// //            console.log('len'+websocket.length);
//             //Object.keys(websocket).length -
//             //someday fix this so it tracks the number of connections
//             for (var i=0; i < 10; i++)
//             {
//                 if (websocket[i])
//                 {
//                     websocket[i].send(data);
//                     //console.info("websocket sending to client "+i);
//                 }
//
//
//             }
//
//         }
//
//     };
/**
 * Created by todd on 3/14/2016.
 */
function wsData(data,id){
    switch(data.type) {
        case "setwebpage":
            websocket[id].pagename = data.data.pagename;
            console.log('Web page set for :'+id+' - '+websocket[id].pagename)
            break;

        case "lightstrip":
                rgb.inwebsocket(data.data);
            break;
                default:
            console.log('unknown datatype '+data.type)
        case 'solar':
            if (data.data.instruction == 'sendkey'){

                console.log('key:'+data.data.key)
                sw.write(data.data.key)
            }
            if (data.data.instruction == 'menu4'){

                sw.sampleMenu4();
            }
            break;
    }

}
