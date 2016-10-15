/**
 * Created by todd on 9/16/2016. A
 */
var request = require('request');

var express = require('express');

var  app = express();
var ejs = require('ejs');
var bodyParser = require('body-parser');
app.use(express.static('public')); // set up the public directory as web accessible
app.use(bodyParser.json()); // lets us get the json body out
app.use(function(err, req, res, next) {
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

    res.send({txt:"server alive - leds in strip:"+numberLEDS,
    serverleds:numberLEDS});


})



app.use(function(req, res, next) {
    res.status(404).send('Witzy - Sorry cant find that!');
});


var webserver = app.listen(8201, function () {
    console.log(ll.ansi('brightBlue','Webserver listening at http://'+webserver.address().address+':'+webserver.address().port));
    server.send({console:"Witzy server UP",serverup:true})
});

// exports.start = function(callback,port) {
//     if (!port){
//         port = 8201
//     }
//     console.log('RGB LED Server api listening on '+port);
//     var apihttp = require("http");
//     apihttp.createServer(function (req, res) {
//         //console.log("Rest server:" + req.url + "(" + req.method + ")");
//         //console.log(req.method);
//         var body = '';
//
//         req.on('data', function (data) {
//             body += data;
//             //console.log("Partial body: " + body);
//         });
//         req.on('end', function () {
//             // this is where the button press happens
//             //   console.log(req.url);
//             //console.log(body);
//             callback(JSON.parse(body));
//             //console.log (stdata.device+ ' '+stdata.value);
//             res.write(body);
//             res.end();
//
//         });
//         req.on('error', function(e) {
//             console.log(e.name + ' was thrown: ' + e.message);
//         });
//
//
//     }).listen(port);
// };
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

