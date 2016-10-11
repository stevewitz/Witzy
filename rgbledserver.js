/**
 * Created by todd on 9/16/2016. A
 */
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
            console.log("Partial body: " + body);
        });
        req.on('end', function () {
            // this is where the button press happens
            //   console.log(req.url);
            try{
                callback(JSON.parse(body));
            }
            catch(e){
                console.log("caught json parse error" + e);
            }

            //console.log (stdata.device+ ' '+stdata.value);
            res.write(body);
            res.end();

        });
        req.on('error', function(e) {
            console.log(e.name + ' was thrown: ' + e.message);
        });


    }).listen(port);
};
