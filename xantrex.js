var thisthing = {
    type:"solar",
    id: witzyname+'-gt3.8',
    name: 'gt3.8 Solar Inverter',
    ipaddress:localaddress+':'+settings.options.webserver.listenport,
    parent:witzyname,
    parenttype:'witzy',
    events:[
        {name:'offline',values:'BOOLEAN',description:'inverter Off-line'},
        {name:'online',values:'BOOLEAN',description:'inverter On-line'},
        {name:'targetValueSet',values:'Set',description:'A target value was reached'},
        {name:'swData',values:'Number',description:'Output Watts and all details'}
    ]

// {
//     "online": true,
//     "voltIn": "296.1",
//     "currentIn": "1.64",
//     "powerIn": "486",
//     "voltOut": "247.0",
//     "currentOut": "1.75",
//     "powerOut": "350",
//     "freqOut": "60.0",
//     "temp": "81.7",
//     "tempLimit": 167,
//     "freq": "59.960",
//     "mpptVolts": "295.4",
//     "tempDerating": false,
//     "powerLimiting": false,
//     "reconnectTime": "0",
//     "khwtoday": "10.325",
//     "efficiency": 0.720164609053498
// }


}
ll.writething(thisthing,true);
var com = require('serialport');
//openSerialPort('/dev/ttyS0');
exports.start = function(scb){

    openSerialPort('/dev/ttyUSB2',scb);

};
console.log('wroking?');
var b = {};
var cb = null;
var avg = [];
var templimit;
var command;
var currentValues = {} // latest info updated every 2 seconds
setInterval(function()
{    exports.getAll(function(o){
    //console.log(JSON.stringify(o, null, 4));
    console.log('Xantrex powerout:'+o.powerOut)
})
},2000);



function openSerialPort(portname,scb)
{
    // console.log("Attempting to open serial port "+portname);
    // serialport declared with the var to make it module global
    if (portname == undefined) {
        console.log("Serial port not specified as command line - no serial port open");
        return;

    }
    //serialPort = new com.SerialPort(portname, {
    serialPort = new com(portname, {
        baudrate: 9600,
// Set the object to fire an event after a \r (chr 13 I think)  is in the serial buffer
        parser: com.parsers.readline("\r")
    });



// I dont understand this call 0 but it works
    serialPort.on("open", function (err,res) {
        serialPort.set({dtr:true,rts:false});
        console.log("Port open success:"+portname);
        getInfo('templimit?',function(z){templimit=((z/10)*1.8)+32;
            scb();
        });

        //serialPort.write('r\r')
              //serialPort.write("VLD# 1 65 1 0\r");
    });

    serialPort.on('data', function(data) {
        if (cb != null){

            cb(data)
        }
//        console.log(data);
    });


    serialPort.on('error', function(error) {
        console.error("serial port failed to open:"+error);

    });
}
exports.write = function(data) {
    serialPort.write(data,function(err, results)
    {

    });
};
function getInfo(x,callback){
    command = x.toUpperCase();
    cb = callback;
    serialPort.write(command+'\r');
}
exports.getAll = function(callback){
var o = {};
    console.time("getAll");
    getInfo('inv?',function(x) {
        o.online = (x == 'ON') ? true:false;
        getInfo('measin?', function (x) {
            o.voltIn = x.substr(2, x.indexOf(' ') - 2);
            o.currentIn = x.substring(x.indexOf(' ') + 3, x.lastIndexOf(' '));
            o.powerIn = x.substring(x.lastIndexOf(' ') + 3);
            getInfo('measout?', function (x) {
                console.log(x);
                o.voltOut = x.substr(2, x.indexOf(' ') - 2);
                x = x.substr(x.indexOf(' ') + 1);
                o.currentOut = x.substr(2, x.indexOf(' ') - 2);
                o.powerOut = x.substring(x.indexOf(' ') + 3, x.lastIndexOf(' '));
                o.freqOut = x.substring(x.lastIndexOf(' ') + 3);

                getInfo('meastemp?', function (x) {
                    o.temp = x.substr(x.indexOf('F') + 2);
                    o.tempLimit = templimit;
                    getInfo('freq?', function (x) {
                        o.freq = x;
                        getInfo('mpptstat?', function (x) {
                            o.mpptVolts = x.substr(2, x.indexOf(' ') - 2);
                            o.tempDerating = ( x.substring(x.indexOf(' ') + 4, x.lastIndexOf(' ')) == '0') ? false : true;
                            o.powerLimiting = (x.substring(x.lastIndexOf(' ') + 4) == '0') ? false : true;
                            getInfo('rectime?', function (x) {
                                o.reconnectTime = x;
                                getInfo('kwhtoday?', function (x) {
                                    o.khwtoday = x;
                                    o.efficiency = o.powerOut / o.powerIn;
                                    console.timeEnd("getAll");

                                    cb = null;
                                    if (callback){
                                        if (o.online != currentValues.online){
                                            // fire on/off line events


                                        }
                                        currentValues = o;
                                        callback(o);
                                    }

                                })
                            })
                        })

                    })

                })

            })

        })

    })
};