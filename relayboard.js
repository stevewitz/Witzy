var debug = 1;
var console = {}
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('grey','relayboard ') + x + '\n');}}})();

if (settings.options.relayboard.toddsfurnace){

    var thisthing = {
        type:"HVAC",
        id: witzyname+'-HVAC relayboard',
        name: 'HVAC extended',
        ipaddress:localaddress+':'+settings.options.webserver.listenport,
        parent:witzyname,
        parenttype:'witzy',
        events:[
            {name:'relayon',values:'NUMBER',description:'relay turned on'},
            {name:'relayoff',values:'NUMBER',description:'relay turned off'},
        ],
        commands:[
            {
                name : "Damper Kids",
                command : "damperkids",
                sendto : "witzy",
                device:'relayboard',
                api:api
            },{
                name : "Damper House",
                command : "damperhouse",
                sendto : "witzy",
                device:'relayboard',
                api:api
            },
            {
                name : "Damper Off",
                command : "damperoff",
                sendto : "witzy",
                device:'relayboard',
                api:api
            },{
                name : "Relay On",
                command : "relayon",
                arguments:{name:'NUMBER'},
                sendto : "witzy",
                device:'relayboard',
                api:api
            },
            {
                name : "Relay Off",
                command : "relayoff",
                arguments:{name:'NUMBER'},
                sendto : "witzy",
                device:'relayboard',
                api:api
            }

        ]

    }

}else
{
    var thisthing = {
        type:"relayboard",
        id: witzyname+'-relayboard',
        name: 'relay board',
        ipaddress:localaddress+':'+settings.options.webserver.listenport,
        parent:witzyname,
        parenttype:'witzy',
        events:[
            {name:'relayon',values:'NUMBER',description:'relay turned on'},
            {name:'relayoff',values:'NUMBER',description:'relay turned off'},
        ],
        commands:[
            {
                name : "Relay On",
                command : "relayon",
                arguments:{name:'NUMBER'},
                sendto : "witzy",
                device:'relayboard',
                api:api
            },
            {
                name : "Relay Off",
                command : "relayoff",
                arguments:{name:'NUMBER'},
                sendto : "witzy",
                device:'relayboard',
                api:api
            }

        ]

    }

}
ll.writething(thisthing,true);
var com = require('serialport');
var data='';
var datastream='';
var serialPort;
//openSerialPort('/dev/ttyS0');
exports.start = function(scb){

  //  openSerialPort(settings.options.relayboard.comport);
    openSerialPort(settings.options.relayboard.comport);
}

exports.incommand = function(c) {
    //delete c.obj
    switch (c.command) {
        case "relayon":
           // serialPort.write(c.value + 'r1\r');
            exports.write(c.value + 'r1\r');
            console.log("at relay on " + c.value);
            break
        case "relayoff":
            serialPort.write(c.value+'r0\r');
            console.log("at relay off "+ c.value);
            break;
        case "damperoff":
            serialPort.write('9r0\r10r0\r');
            break;
        case "damperkids":
            serialPort.write('9r1\r10r1\r');
            break;
        case "damperhouse":
            serialPort.write('9r1\r10r0\r');
            break;

        default:
            console.log('Unknown command for relay board'+c.command)

    }
}
function openSerialPort(portname)
{
    if (portname == undefined) {
        console.log("Serial port not specified as command line - no serial port open");
        return;

    }
    //serialPort = new com.SerialPort(portname, {
    serialPort = new com(portname, {
        baudrate: 9600,
// Set the object to fire an event after a \r (chr 13 I think)  is in the serial buffer
  //      parser: com.parsers.readline("\r"),
//        parser: com.parsers.readline("\n")
    });



// I dont understand this call 0 but it works
    serialPort.on("open", function (err,res) {
        console.log('Relay Board com port open'+portname)
    });

    serialPort.on('data', function(sbuffer) {
        datastream += sbuffer.toString();


        if (datastream.indexOf('\r') != -1 || datastream.indexOf('\n') != -1) {
        while (true){
            if (datastream.indexOf('\r') != -1) {
                data = datastream.substring(0, datastream.indexOf('\r'));
                datastream = datastream.substring(datastream.indexOf('\r') + 1);
            }
            if (datastream.indexOf('\n') != -1) {
                data = datastream.substring(0, datastream.indexOf('\n'));
                datastream = datastream.substring(datastream.indexOf('\n') + 1);
            }
            if (data == ''){break;}
             console.log('Relay Board Data:'+data);
            var o = {}
            //    relay: Number(data.substr(0, data.indexOf('R'))),
            //   state: Number(data.substr(data.indexOf('R') + 1, 1))

            if (data.length == 3 || data.length > 4) {
                o.port = Number(data.substr(0, 1))
                data = data.substr(1)
            } else if (data.length == 4) {
                o.port = Number(data.substr(0, 2))
                data = data.substr(2)
            }
            o.event = data.substr(0, 1);
            o.state = data.substr(1);
//            console.log(JSON.stringify(o,null,4));


            var event = {
                id: thisthing.id,
                value: o.port,
                eventdata: o,
                source: thisthing.id

            };

            switch (o.event) {
                case "R":
                    if (o.state == 0) {
                        event.event = 'relayoff'
                    } else {
                        event.event = 'relayon'
                    }
                    break;
                case "1":
                    if (o.state == 0) {
                        event.event = 'input1off'
                    } else {
                        event.event = 'input1on'
                    }
                    break;
                case "0":
                    if (o.state == 0) {
                        event.event = 'input0off'
                    } else {
                        event.event = 'input0on'
                    }
                    break;
                case "A":
                    if (o.state == 0) {
                        event.event = 'inputAoff'
                    } else {
                        event.event = 'inputAon'
                    }
                    break;
                case "B":
                    if (o.state == 0) {
                        event.event = 'inputBoff'
                    } else {
                        event.event = 'inputBon'
                    }
                    break;
                case "D":
                    event.event = 'cardread';
                    o.cardnumber = o.state;
                    event.eventdata = o;

                    break;
                default:
                    console.log('Unknown cardread data:' + data + JSON.stringify(o))


            }
            if (o.cardnumber && o.cardnumber.length<4){
                console.log('Bad cardno:'+o.cardnumber)
            }else{
                server.send({event: event})
            }


            data = ''
        }
    }
    })


    serialPort.on('error', function(error) {
        console.log("serial port failed to open:"+error);

    });
};


exports.write = function(data) {
    console.log('relay board write:'+data)
    serialPort.write(data,function(err, results)
    {
        if (err){console.log('relay board comm write error:'+err)}//else{console.log('sw write:'+data)}
    });
};