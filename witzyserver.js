/**
 * Created by todd on 9/16/2016. A
 */
var request = require('request');

exports.start = function(callback,port) {
    if (!port){
        port = 8201
    }
    console.log('RGB LED Server api listening on '+port);
    var apihttp = require("http");
    apihttp.createServer(function (req, res) {
        //console.log("Rest server:" + req.url + "(" + req.method + ")");
        //console.log(req.method);
        var body = '';

        req.on('data', function (data) {
            body += data;
            //console.log("Partial body: " + body);
        });
        req.on('end', function () {
            // this is where the button press happens
            //   console.log(req.url);
            //console.log(body);
            callback(JSON.parse(body));
            //console.log (stdata.device+ ' '+stdata.value);
            res.write(body);
            res.end();

        });
        req.on('error', function(e) {
            console.log(e.name + ' was thrown: ' + e.message);
        });


    }).listen(port);
};
exports.send = function(data,exitcode){
    //this will send data back to the witzy.api
    // use for buttons - status updats - etc

    var request_options = {
        uri:'http://10.6.1.2:3000/api/witzy',
        method:"POST",
        json: data
    };
    request(request_options,function(error, response, body){
        if(response.statusCode != '200'){
            console.log('Error sending to api server:'+JSON.stringify(response,null,4));

        }
        if (exitcode){
            process.exit(exitcode);

        }
        console.log('command sent to witzy api');
    });



}

exports.cleanup = function(callback) {
//https://github.com/nodejs/node-v0.x-archive/blob/master/doc/api/process.markdown#exit-codes
//http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    // catch ctrl+c event and exit normally

    process.on('SIGINT', function () {
        server.send({console:"Witzy server DOWN-SIGINT",serverup:false},2)

        console.log('Ctrl-C...');

    });

    //catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', function(e) {
        console.log('Uncaught Exception...');
        process.stdin.resume();
        console.log('\n'+e.stack);
        server.send({console:"Witzy server DOWN-UNCAUGHTEXCEPTION",error:e,serverup:false},1)


      //  process.exit(1);
    });
};
