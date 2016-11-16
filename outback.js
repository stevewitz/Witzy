var thisthing = {
    type:"solar",
    id: witzyname+'-mx60',
    name: 'mx60 Charge Controller B',
    ipaddress:localaddress+':'+settings.options.webserver.listenport,
    parent:witzyname,
    parenttype:'witzy',
    events:[
        {name:'chargeTypeChange',values:'STRING',
            description:'Charger changes modes:Silent(Off),Bulk(Common if inverter using power),Float (Battery Full),Absorb,EQ'},
        {name:'mxData',values:'Number',description:'Changing Watts and all details'}
    ]

}
ll.writething(thisthing,true);

setInterval(function(){
    if (oneMinuteAvg.pvVoltage > 16){
        server.send({event:{
            id:thisthing.id,
            event:'mxData',
            value:oneMinuteAvg.chargerCurrent*oneMinuteAvg.batteryVoltage,
            eventdata:oneMinuteAvg,
            source:thisthing.id

        }})


    }
},60000);


var com = require('serialport');
//openSerialPort('/dev/ttyS0');
exports.start = function(scb){

    openSerialPort('/dev/ttyUSB1',scb);

}
console.log('wroking?');
var b = {chargeMode:'unknown'};

var avg = [];
var oneMinuteAvg;
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
        baudrate: 19200,
// Set the object to fire an event after a \r (chr 13 I think)  is in the serial buffer
        parser: com.parsers.readline("\r")
    });



// I dont understand this call 0 but it works
    serialPort.on("open", function (err,res) {
        serialPort.set({dtr:true,rts:false});
        console.log("Port open success:"+portname);
        scb();
        //serialPort.write('r\r')
              //serialPort.write("VLD# 1 65 1 0\r");
    });

    serialPort.on('data', function(data) {
        data = data.replace(/,/g,' ').match(/\S+/g); // breaks string into array
        var o = {
            address:data[0],
            chargerCurrent:data[2],
            pvCurrent:data[3],
            pvVoltage:data[4],
            dailyKWH:data[5]/10,
            batteryVoltage:data[10]/10,
            dailyAH:data[11]
        };
       // error mode not likely implemented in my firmware
        if   (Number(data[8]) > 0 ){// error mode
            var text
            switch (data[8]){
                case 32:
                    text = 'Shorted Battery Sensor'
                    break;
                case 64:
                    text = 'Too Hot'
                    break;
                case 128:
                    text = 'High VOC (panel volatage too high)'
                    break;

            }
            o.error = {val:data[8],text:text}
            //send the event change here
        }
//        auxMode:data[7],
        switch (Number(data[7])){ // aux mode
            case 0:
                o.auxMode = 'Disabled';
                break;
            case 1:
                o.auxMode = 'Diversion';
                break;
            case 2:
                o.auxMode = 'Remote';
                break;
            case 3:
                o.auxMode = 'Manual';
                break;
            case 4:
                o.auxMode = 'Vent Fan';
                break;
            case 5:
                o.auxMode = 'PV Trigger';
                break;
        }
//            chargeMode:data[9],

        switch (Number(data[9])) { // aux mode
            case 0:
                o.chargeMode = 'Silent';
                break;
            case 1:
                o.chargeMode = 'Float';
                break;
            case 2:
                o.chargeMode = 'Bulk';
                break;
            case 3:
                o.chargeMode = 'Absorb';
                break;
            case 4:
                o.chargeMode = 'EQ';
                break;
            default:
                console.log('chargemode'+data[9])
        }

        if (o.chargeMode != b.chargeMode && o.address == "B"){

            console.log('Charge Mode Changed:'+o.chargeMode)
            o.chargeModeOld = b.chargeMode; // add the prev charge mode to the reporting object
            b.chargeMode = o.chargeMode; // update
            server.send({event:{
                id:thisthing.id,
                event:'chargeTypeChange',
                value:b.chargeMode,
                eventdata:o,
                source:thisthing.id

            }})

        }





        if (o.address == "B"){
            // lets do the avgerage stuff
           // console.log(o)
            avg.unshift(o); // add the rec to the top of the array
            if (avg.length > 60){
                avg.pop(); // take the last record away
            }
            var a = {chargerCurrent:0,
                    batteryVoltage:0,
                    pvCurrent:0,
                    pvVoltage:0}

            for (var i = 0; i < avg.length; i++){

                a.chargerCurrent += Number(avg[i].chargerCurrent);
                a.batteryVoltage += Number(avg[i].batteryVoltage);
                a.pvCurrent +=Number(avg[i].pvCurrent);
                a.pvVoltage +=Number(avg[i].pvVoltage);
            }

           for (var prop in a){
               a[prop] = (a[prop]/avg.length)
           }
           a.address = o.address;
           a.dailyKWH = o.dailyKWH;
           a.auxMode = o.auxMode;
           a.chargeMode = o.chargeMode ;
          // console.log(JSON.stringify(a,null,4));
            oneMinuteAvg = a;
        }

    })


    serialPort.on('error', function(error) {
        console.error("serial port failed to open:"+error);

    });
};

