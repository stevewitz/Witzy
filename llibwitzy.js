/**
 * Created by todd on 10/13/2016.
 */
var debug = 1;
var console = {};

var os = require('os');
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('magenta','llib     ') + x + '\n');}}})();
MC = require('mongodb').MongoClient;
const fs = require('fs');



process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
if (chunk !== null) {
    commandline(chunk);
}
});

exports.startmongo = function(collectionname,ip,callback) {
// starts the mongo collection
// returns the settings object from the database
    console.log (os.type())
    MC.connect('mongodb://'+ ip+':27017/'+collectionname, function (err, db) {

        if (!err) {

            global.db = db;
            //load setting database into memory

            db.collection('settings').findOne({"type": "settings"}, function (err, result) {
                if (result) {
                    global.settings = result;

                    db.collection('things').find({}).toArray( function (err, result) {

                        global.things=result;
                        callback();
                    });

                } else {
                    console.log("Witzy Settings not fould in database - creating emtpy");
                    //retrun an empty object

                    global.settings ={
                        type:"settings",
                        options:{
                            modules:{
                                rgbled:false,
                                swinverter:false,
                                relayboard:false
                            },

                            websocket:{listenport:8300},
                            webserver:{listenport:8201},
                            relayboard:{comport:'com4'}
                        },
                        rulzy:{ipaddress:rulzyip},
                        hardware:{
                            rgbled:[
                                {
                                    name:'strip1',
                                    leds:50,
                                    type:"virtual",
                                    createdevice :true,
                                    addtosmartthings:false
                                }]
                        }

                    };

                    db.collection('settings').insertOne(settings, function (err, res) {
                       if (err){
                           console.log('Error creating mongo settings:',err)

                       }
                        console.log("Witzy settings created " + res);
                        console.log('please restart');
                        process.exit(0);


                    });
                }
            });


        } else {
            console.log("No mongo connection")
        }


    });
};


exports.ansi = function (color,text){

    if(os.type() == "Windows_NT") {

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
    } else
    {
        //  switch black and white for pi
        var codes = {

            white: 30
            , black: 37
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
    }
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
        server.send({console:"Witzy server DOWN-CTRL-C" +witzyname+"@"+localaddress+':'+settings.options.webserver.listenport,
            event:{
                id:witzyname,
                event:'serverstatus',
                value:'offline',
                eventdata:{},
                source:witzyname
            }
        },2);

        console.log('Ctrl-C...');
    });

    //catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', function(e) {
        console.log('Uncaught Exception...');
        process.stdin.resume();
        console.log('\n'+e.stack);
        server.send({console:"Witzy server DOWN-UNCAUGHTEXCEPTION"+witzyname+"@"+localaddress+':'+settings.options.webserver.listenport,
            event:{
            id:witzyname,
            event:'serverstatus',
            value:'offline',
            eventdata:{error:e},
            source:witzyname
        }
        },1);

            // moved exit to server.send
          //process.exit(1);
    });
};


process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
if (chunk !== null) {
   console.log(chunk)
}
});

exports.savesettings = function(){
    db.collection('settings').updateOne({'type':'settings'},settings,{upsert:true, w:1},function(err,res){
        if (err){
            console.log('failure writing settings to mongo -- aborting');
            process.exit(1);
        }

    });



};
function commandline(s){

    s = s.toString();
    t = s.replace(/,/g,' ').match(/\S+/g); // breaks string into array
    if (!t || !t[0]){return}
    var targetmenu;
    var targetsubmenu
    var targetvalue
    switch (t[0]) {
        case "x":
        case "stop":
        case "exit":
            process.exit(0);
            break;
        case "setup":
            fs.writeFile('setup.txt', t[1]+','+t[2]+','+t[3], (err) => {
                if (err) throw err;
                console.log('server named:'+t[2])
                console.log('Rulzy Server Ip&port:'+t[3])
                console.log("Mongo IP addess saved ("+t[1]+") please restart")
                process.exit(0);
            })
            break;
        case "rulzy":
            settings.rulzy.ipaddress = t[1];
            ll.savesettings();
            console.log("Rulzy IP addess saved ("+t[1]+") ")
            break;
        case "makeleddevice":
            ll.makeleddevice(t[1],t[2],t[3],t[4]);

                break;
        case "break":
            x=llkkk  // intentional error
            break;
// sw trace commands following
        case "r":
            sw.write('r');
            break;
        case "s":
            sw.write('\x13');
            break;

        case "l":
            sw.write('l');
            break;
        case "v":
            sw.write('v');
        case "u":
            sw.write('u');
            break;
        case "d":
            sw.write('d');
            break;
        case "/":
            sw.write('/');
            break;
        case "-":
            sw.write('-');
            break;

        case "=":
        case "+":
            sw.write('=');
            break;
        case "go":

            targetmenu = t[1]
            if (t[2] == null) {
                targetsubmenu = 0}
            else
            {
                targetsubmenu = t[2];
            }


            console.log('seeking '+targetmenu+','+targetsubmenu);
            sw.goInverterValue(targetmenu, targetsubmenu,sw.testcallback)


            break;

        case "get":

            targetmenu = t[1]
            if (t[2] == null) {
                targetsubmenu = 0}
            else
            {
                targetsubmenu = t[2];
            }
            if (t[3] != null){
                console.log('t3'+t[3])
                samples = t[3];
            }else
            {
                samples = 10;
            }


            console.log('seeking '+targetmenu+','+targetsubmenu);
            sw.getInverterValue(targetmenu, targetsubmenu,samples,sw.testcallback)


            break;
        case "set":

            targetmenu = t[1]
            if (t[2] == null) {
                targetsubmenu = 0}
            else
            {
                targetsubmenu = t[2];
            }
            if (t[3] != null){
                console.log('t3'+t[3])
                targetvalue = t[3];
            }

            console.log('seeking '+targetmenu+','+targetsubmenu);
            sw.setInverterValue(targetmenu, targetsubmenu,targetvalue,sw.testcallback)


            break;
        case 'menu4':
            sw.sampleMenu4();
            break;
        default:
            console.log('Unknown input:'+s)

    }

}
exports.serverup = function(){
    var serverconfig = {
        ipaddress:localaddress+':'+settings.options.webserver.listenport,
        name:witzyname,
        id:witzyname,
        controller:"witzy",
        type:"server",
        ipaddess:localaddress+':'+settings.options.webserver.listenport,
        events:[{name:'serverstatus',values:["online,offline"]},
            {name:'monitorstate',values:["on,off"]}]
    }
    if (os.type() == 'Linux'){
            serverconfig.commands = [
            {name:'monitor On',
                sendto:"witzy",
                device:'server',
                api:api,
                command:'monitorOn',
            },
                {name:'monitor Off',
                    sendto:"witzy",
                    device:'server',
                    api:api,
                    command:'monitorOff',
                }
            ]
    }

    server.send({console: "Witzy server UP:"+witzyname+"@"+localaddress+':'+settings.options.webserver.listenport,
        serverconfig:serverconfig,
        event:{
            id:witzyname,
            event:'serverstatus',
            value:'online',
            eventdata:{},
            source:witzyname
        },
        things:things
    })

}
exports.writething = function(obj,savesettings,dontmerge){
    // This adds or updates an object to the settings

    if (!obj.id){return false;}

    // update whatever webpages with the new data
    if(typeof(websock) != 'undefined'){
        websock.send(JSON.stringify({object:"things",data:things}));
    }


    var indexval = -1;
    things.some(function(e,index){
        if (e.id == obj.id){
            indexval = index;
            return true;
        }
    });
    // merge objects - add new values only
    if (indexval != -1 && !dontmerge){

        for (var prop in obj){
            things[indexval][prop] = obj[prop];
            //   console.log( obj[prop])
        }
//        things[indexval] = obj;

    }else if (indexval != -1 && dontmerge){
        // just skip - already on entry
        return;


    }
    else// add item
    {
        things.push(obj);
        indexval = things.length-1;
        console.log('Added NEW Object to things:'+obj.label+"("+obj.name+')');
        // if (savesettings){
        //     db.collection('things').insertOne({"id": obj.id},things[indexval], function (err, result) {
        //
        //     });
        //
        //     }
    }
    if (savesettings){
        // dont need to write settings anymore
        //this.savesettings();
        db.collection('things').updateOne({"id": obj.id},things[indexval],{upsert: true}, function (err, result) {
            console.log(obj.name +' Updated' +err)
        });





    }

};

// ha