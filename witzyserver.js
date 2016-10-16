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

        console.log(req.body)


        res.status(200).end();

    });

    app.get('/api', function (req, res) {

        res.render('api.ejs');


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
        server.send({console: "Witzy server UP:"+witzyname+"@"+localaddress+':'+settings.options.webserver.listenport,
            ipaddess:localaddress+':'+settings.options.webserver.listenport,
            serverup: true,
            name:witzyname,
            id:witzyname,
            controller:"witzy",
            type:"server",
            ipaddess:localaddress+':'+settings.options.webserver.listenport})
    });
}

exports.send = function(data,exitcode){
    //this will send data back to the witzy.api
    // use for buttons - status updats - etc

    var request_options = {
        uri:'http://192.168.2.222:3001/api/witzy',
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

