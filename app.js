ll = require('./llibwitzy');
global.server = require('./witzyserver');
const fs = require('fs');
ll.cleanup();

fs.readFile('mongoipadderss.txt', 'utf8',function(err,filetxt){

    if (err){
        console.log(ll.ansi('inverse','WARNING:')+" no ipaddress set for mongo.");
        console.log(ll.ansi('red','Type "setup <Rulzy ipaddress>,<Witzy server name>"<enter> in the terminal window to set address'));
    }else{
        var t = filetxt.replace(',',' ').match(/\S+/g); // breaks string into array
        if (t[0] && t[1]){

            global.rulzyip = t[0];
            global.witzyname = t[1];
            console.log("Rulzy IP:",rulzyip);
            console.log("Witzy server name:",witzyname)

        } else
        {
            console.log(ll.ansi('inverse','WARNING:')+" no ipaddress set for mongo.");
            console.log(ll.ansi('red','Type "setup <Rulzy ipaddress>,<Witzy server name>"<enter> in the terminal window to set address'));
            return;

        }


        require('dns').lookup(require('os').hostname(), function (err, add) {
            if (err) {
                console.log('Local ip address lookup failed. \nError: ' + err,data)

            } else{
                global.localaddress = add;
                console.log('Local ip:'+localaddress);
                ll.startmongo('witzy-'+witzyname,rulzyip,initialized)




            }


        });












    }


});


function initialized(){



    server.start()

}



numberLEDS = 50; // set this global here

// captures errors and ctrl-c's
//process.stdin.resume();


