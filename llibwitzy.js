/**
 * Created by todd on 10/13/2016.
 */
var debug = 1;
var console = {};
const fs = require('fs');

console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('magenta','llib     ') + x + '\n');}}})();
MC = require('mongodb').MongoClient;


process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
if (chunk !== null) {
    commandline(chunk);
}
});


exports.startmongo = function(collectionname,ip,callback) {
// starts the mongo collection
// returns the settings object from the database

    MC.connect('mongodb://'+ ip+':27017/'+collectionname, function (err, db) {

        if (!err) {

            global.db = db;
            //load setting database into memory

            db.collection('settings').findOne({"type": "settings"}, function (err, result) {
                if (result) {
                    global.settings = result;
                        callback();

                } else {
                    console.log("Gatherer Settings not fould in database - creating emtpy");
                    //retrun an empty object

                    global.settings ={
                        type:"settings",
                        options:{
                            modules:{rgbled:false},
                            websocket:{listenport:8300},
                            webserver:{listenport:8201},
                        },
                        rulzy:{ipaddrss:'10.6.1.2:3000'}

                    };

                    db.collection('witzysettings').insertOne(settings, function (err, res) {
                       if (err){
                           console.log('Error creating mongo settings:',err)

                       }
                        console.log("Witzy settings created " + res);
                        callback();

                    });
                }
            });


        } else {
            console.log("No mongo connection")
        }


    });
};


exports.ansi = function (color,text){
    var codes = {
        white: 37
        , black: 30
        , blue: 34
        , cyan: 36
        , green: 32
        , magenta: 35
        , red: 31
        , yellow: 33
        , grey: 90
        , brightBlack: 90
        , brightRed: 91
        , brightGreen: 92
        , brightYellow: 93
        , brightBlue: 94
        , brightMagenta: 95
        , brightCyan: 96
        , brightWhite: 97
        , bold: 1
        , italic: 3
        , underline: 4
        , inverse: 7
        , unbold: 22
        , unitalic: 23
        , ununderline: 24
        , uninverse: 27
    };

    return '\x1b['+codes[color]+'m'+text+'\x1b['+codes['black']+'m\x1b[27m';

}
exports.ansitime = function(color,text){

    return new Date().toLocaleTimeString()+ ' '+this.ansi(color,text.rpad(14))

}
String.prototype.rpad = function(length) {
    var str = this;
    while (str.length < length)
        str = str + ' ';
    return str;
}
exports.cleanup = function(callback) {
//https://github.com/nodejs/node-v0.x-archive/blob/master/doc/api/process.markdown#exit-codes
//http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    // catch ctrl+c event and exit normally

    process.on('SIGINT', function () {
        server.send({console:"Witzy server DOWN-SIGINT",name:witzyname,serverup:false},2);

        console.log('Ctrl-C...');

    });

    //catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', function(e) {
        console.log('Uncaught Exception...');
        process.stdin.resume();
        console.log('\n'+e.stack);
        server.send({console:"Witzy server DOWN-UNCAUGHTEXCEPTION",error:e,name:witzyname,serverup:false},1);


        //  process.exit(1);
    });
};


process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
if (chunk !== null) {
   console.log(chunk)
}
});


function commandline(s){
    s = s.toString();
    t = s.replace(',',' ').match(/\S+/g); // breaks string into array
    switch (t[0]) {
        case "stop":
        case "exit":
            process.exit(0);
            break;
        case "setup":
            fs.writeFile('mongoipadderss.txt', t[1]+','+t[2], (err) => {
                if (err) throw err;
                console.log('server named:',t[2])
                console.log("Mongo IP addess saved ("+t[1]+") please restart")
                process.exit(0);
            })
            break;


        default:
            console.log('Unknown input:'+s)

    }

}