var debug = 1;
var console = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('green','witzyserver ') + x + '\n');}}})();
/**
 * Created by todd on 9/16/2016. A
 */
var request = require('request');

exports.start = function() {


    var express = require('express');
    var app = express();
    var ejs = require('ejs');
    var bodyParser = require('body-parser');
    app.use(express.static('public')); // set up the public directory as web accessible
    app.use(bodyParser.json()); // lets us get the json body out
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.send(500, 'Something broke!');
    });
    app.post('/api', function (req, res) {
        switch (req.body.obj.device){
            case 'rgb':
                rgb.incommand(req.body);
                break;
            case 'sw5548':
                rgb.incommand(req.body);


        }

        res.send({
            ok: "ok"
        });
  //      res.body = {ok:'ok'}
//        res.status(200).end();

    });
    app.get('/solar', function (req, res) {
        res.render('solar.ejs',{things:things,settings:global.settings,wsport:settings.options.websocket.listenport});
    })
    app.get('/api', function (req, res) {
        res.render('api.ejs');
    })
    app.get('/lightstrip', function (req, res) {
        res.render('lightstrip.ejs',{things:things,settings:global.settings,wsport:settings.options.websocket.listenport});
    })

    app.get('/servertest', function (req, res) {

        res.send({
            txt: "server alive - leds in strip:" + numberLEDS,
            serverleds: numberLEDS
        });


    })


    app.use(function (req, res, next) {
        res.status(404).send('Witzy - Sorry cant find that!');
    });


    var webserver = app.listen(settings.options.webserver.listenport, function () {
        console.log(ll.ansi('brightBlue', 'Webserver listening at http://' + webserver.address().address + ':' + webserver.address().port));
        ll.serverup();
    });
}

exports.send = function(data,exitcode){
    //this will send data back to the witzy.api
    // use for buttons - status updats - etc
if (exitcode){global.exitcode = exitcode}
    if (!settings.rulzy.ipaddress){
    console.log(ll.ansi('inverse','WARNING:')+" no ipaddress set for mongo.");
    console.log(ll.ansi('red','Type "rulzy <RULZY ipaddress:port>"<enter> in the terminal window to set address'));
    return;
}


    var request_options = {
        uri:'http://'+settings.rulzy.ipaddress+'/api/witzy',
        method:"POST",
        json: data
    };
    request(request_options,function(error, response, body){
        if(exitcode){
            console.log('exit code'+exitcode)
        }


        if (error){
            console.log('Error sending to api server:'+JSON.stringify(request_options,null,4));
            //process.exit(exitcode);
            if (exitcode){

                process.exit(exitcode);

            }
            return;
        }
        if(response.statusCode != '200'){
            console.log('Error sending to api server status code:'+response.statusCode);

        }
        if (exitcode){
            console.log('** exitcode')
            process.exit(exitcode);

        }
      //  console.log('command sent to witzy api');
    });



}

