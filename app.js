ll = require('./llibwitzy');


const fs = require('fs');
ll.cleanup();

fs.readFile('setup.txt', 'utf8',function(err,filetxt){

    if (err){
        console.log(ll.ansi('inverse','WARNING:')+" no ipaddress set for mongo.");
        console.log(ll.ansi('red','Type "setup <mongo ipaddress>,<Witzy server name>,<Rulzy ipaddress:port>"<enter> in the terminal window to set address'));
    }else{
        var t = filetxt.replace(/,/g,' ').match(/\S+/g); // breaks string into array
        if (t[0] && t[1] && t[2]){

            global.mongo = t[0]
            global.witzyname = t[1];
            global.rulzyip = t[2];
            console.log("Rulzy IP:",rulzyip);
            console.log("Witzy server name:",witzyname)

        } else
        {
            console.log(ll.ansi('inverse','WARNING:')+" no ipaddress set for mongo.");
            console.log(ll.ansi('red','Type "setup <Mongo ipaddress>,<Witzy server name>"<enter> in the terminal window to set address'));
            return;

        }


        /******
         *
         *
         */
// this will likely break with multiple ipv4 addpresses
        var os = require('os');
        var ifaces = os.networkInterfaces();

        Object.keys(ifaces).forEach(function (ifname) {
            var alias = 0;

            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }

                global.localaddress = iface.address;
                console.log('Local ip:'+localaddress);
                ll.startmongo('witzy-'+witzyname,mongo,initialized)
//                console.log(ifname, iface.address);
                return;


                // if (alias >= 1) {
                //     // this single interface has multiple ipv4 addresses
                //     console.log(ifname + ':' + alias, iface.address);
                // } else {
                //     // this interface has only one ipv4 adress
                //     console.log(ifname, iface.address);
                // }
                ++alias;
            });
        });


    }


});


function initialized(){
    global.server = require('./witzyserver');
    websock = require('./websocket');
    if (settings.options.modules.rgbled){
        rgb = require('./rgbled');
        console.log('RGB Module loaded')
    }
    if (settings.options.modules.swinverter){
        sw = require('./traceinverter');
        var ob = require('./outback');

        sw.start(function(){
            console.log('Trace SW5548 Inverter loaded');
            ob.start(function(){
                console.log('Outback Charge Controller Monitor Loaded')
            })
            //trace.getInverterValue(4,2,testcallback)
        })
    }


    server.start()



}



//numberLEDS = 50; // set this global here

// captures errors and ctrl-c's
//process.stdin.resume();


