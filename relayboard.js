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
ll.writething(thisthing,true);
var com = require('serialport');
var data='';
var datastream=''
//openSerialPort('/dev/ttyS0');
exports.start = function(scb){

    openSerialPort(settings.options.relayboard.comport);
}

exports.incommand = function(c) {
    delete c.obj
    console.log(JSON.stringify(c,null,4))
    switch (c.command) {
        case "relayon":
            serialPort.write(c.value+'r1\r');
            break
        case "relayoff":
            serialPort.write(c.value+'r0\r');
            break;

        case "invertermode":
            switch (c.value){
                case "float":
                    exports.setInverterValue(9,1,'FL')
                    break;
                case "sell":
                    exports.setInverterValue(9,1,'SE')
                    break;
                case "silent":
                    exports.setInverterValue(9,1,'SL')
                    break;
                case "low battery transfer":
                    exports.setInverterValue(9,1,'LB')
                    break;

                default:
                    console.log('Unknown value for command for SW'+c.value+':'+c.command)
            }
            break;
        default:
            console.log('Unknown command for SW'+c.command)

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
  //      console.log(sbuffer);
        datastream += sbuffer;
        if (datastream.indexOf('\r')  != -1 || datastream.indexOf('\n')  != -1 ) {

            if (datastream.indexOf('\r')  != -1){
                data=datastream.substring(0,datastream.indexOf('\r'));
                datastream=datastream.substr(datastream.indexOf('\r')+1);
            }
            if (datastream.indexOf('\n')  != -1){
                data=datastream.substring(0,datastream.indexOf('\n'));
                datastream=datastream.substr(datastream.indexOf('\n')+1);


            }
            console.log('Relay Board Data:'+data);
            var o = {}
            //    relay: Number(data.substr(0, data.indexOf('R'))),
                //   state: Number(data.substr(data.indexOf('R') + 1, 1))

            if (data.length == 3 || data.length > 4){
                o.port =  Number(data.substr(0,1))
                data = data.substr(1)
            } else if (data.length == 4){
                o.port = Number(data.substr(0,2))
                data = data.substr(2)
            }
            o.event = data.substr(0,1);
            o.state = data.substr(1);
//            console.log(JSON.stringify(o,null,4));


            var event = {
                id: thisthing.id,
                value: o.port,
                eventdata: o,
                source: thisthing.id

            };

            switch(o.event){
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
                    console.log('Unknown cardread data:'+data+JSON.stringify(o))


            }
            server.send({event:event})


        }
    })


    serialPort.on('error', function(error) {
        console.error("serial port failed to open:"+error);

    });
};


exports.write = function(data) {
    serialPort.write(data,function(err, results)
    {
        if (err){console.log('relay board comm write error:'+err)}//else{console.log('sw write:'+data)}
    });
};