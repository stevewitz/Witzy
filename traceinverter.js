var com = require('serialport');
//openSerialPort('/dev/ttyS0');
exports.start = function(scb){

    openSerialPort('/dev/ttyUSB0',scb);

}
console.log('wroking?');
process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
if (chunk !== null) {
    commandline(chunk);
}
});
var sbuffer = '';
var menu = 0;
var submenu = 0;
var display = '';
var t;
var data;
var targetmenu = 0;
var targetsubmenu = 0;
var getdata = false;
var callback ;
var progresscallback;
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
   //     parser: com.parsers.readline("\r")
    });



// I dont understand this call 0 but it works
    serialPort.on("open", function (err,res) {
        console.log("Port open success:"+portname);
        scb();
        //serialPort.write('r\r')
              //serialPort.write("VLD# 1 65 1 0\r");
    });

    serialPort.on('data', function(data) {
       if (t){
           clearTimeout(t);
       }
//console.log(data)

        sbuffer += data;
        if (sbuffer.indexOf('\r')  != -1){
          // have a menu item message - this is the only type we can detect
            t = setTimeout(function(){
                console.log('Timeout:');

                if (sbuffer.indexOf('\r\n\r\n') != -1){
                    console.log('leds:'+sbuffer)
                } else
                {
                    // junk
                    console.log('unknown:'+sbuffer);
                }
                sbuffer = ''
            },25);
            startchar = sbuffer.indexOf('\r');
            //console.log('0x0d found@'+startchar)
            // I think all menu dumps are the same length

            if (sbuffer.length >= startchar+37){
                //console.log('full message?')
                display = sbuffer.substr(startchar+2,35);
                console.log(display+'*');
                if (sbuffer.substr(startchar+35,2) > 0){

                    menu = Number(sbuffer.substr(startchar+35,2));
                    submenu = 0; // if we are in a submenu this is replaced

                }
                // fix for duplicate items

                if (menu == 2){
                    display = '2'+display;
                }
                sbuffer = sbuffer.substr(startchar+37,2);
                if (sbuffer.length > 0){
                    console.log('chars remaining'+sbuffer.length)
                }
                if (menusys[display]){
                    menusys[display].data = '';

                    //menu = menusys[display].menu;
                    submenu = menusys[display].sub;
                }

                clearTimeout(t);
                // ok - we know where we are check if its where we want to be
                console.log('menu:'+menu+':'+submenu+ '  --  '+targetmenu+':'+targetsubmenu);

                if (targetmenu > 0){
                    if (menu == targetmenu){
                        console.log('At target menu');
                        if (submenu == targetsubmenu){
                            console.log('At subtarget menu')
                            targetmenu = 0;
                            targetsubmenu = 0;
                            if ( menusys[display] && menusys[display].hasdata){
                                getdata = true;
                            }
                        } else if (submenu > targetsubmenu){
                            console.log('going up');
                            serialPort.write('u')

                        }else if (submenu < targetsubmenu)
                        {
                            console.log('going down');
                            serialPort.write('d')

                        }



                    } else if (targetmenu >= 9 && menu < 9){
                        console.log('entering setup mode');
                        serialPort.write('\x13');
                    } else if (menu < targetmenu)
                    {
                        console.log('going left');
                        serialPort.write('l')

                    } else if (menu > targetmenu)
                    {
                        console.log('going right');
                        serialPort.write('r')

                    }



                }

            }
        } else {
            // lets parse what is in here - values or yes/no's etc
            if (menusys[display] && menusys[display].hasdata ){
                if (sbuffer.length >= menusys[display].charlen){
                    data = sbuffer.substr(0, menusys[display].charlen)
                    data = data.replace(/ /g,'')
                    if (data.length >0){
                        if (getdata && callback){
                            getdata = false;
                            callback({menu:menu,
                                      submenu:submenu,
                                      value:data,
                                      display:display})

                        }
                        if (menusys[display].data != data){
                            console.log(display+'*Data:'+data+':'+data.length)
                        }


                        menusys[display].data = data;
                    }

                    sbuffer = sbuffer.substr(menusys[display].charlen+1)
                    if (sbuffer.length != 0 ){
                        console.log('more')
                        //sbuffer = ''
                    }

                }

            }



        }

       // console.log(data)

       // console.log(data.toString())

    });
    serialPort.on('error', function(error) {
        console.error("serial port failed to open:"+error);

    });
};

exports.write = function(data) {
    serialPort.write(data,function(err, results)
    {

    });
};
function commandline(s){
    s = s.toString();
    t = s.replace(',',' ').match(/\S+/g); // breaks string into array
    // console.log(t.length)
    // for (i = 0; i < t.length; i++){
    //     console.log(i,t[i])
    //
    // }
        switch (t[0]) {
        case "stop":
        case "exit":
            process.exit(0);
            break;
        case "r":
            serialPort.write('r');
            break;
        case "s":
            serialPort.write('\x13');
            break;

        case "l":
            serialPort.write('l');
            break;
        case "v":
            serialPort.write('v');
            break;

        case "u":
            serialPort.write('u');
            break;
        case "d":
            serialPort.write('d');
            break;
        case "/":
            serialPort.write('/');
            break;
        case "-":
            serialPort.write('-');
            break;

        case "=":
        case "+":
            serialPort.write('=');
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
            serialPort.write('u');
            callback = testcallback
            break;
        default:

            console.log('Unknown input:'+s)

    }

}
exports.getInverterValue = function(reqmenu,reqsubmenu,cb,progresscb){
    targetmenu = reqmenu;
    targetsubmenu = reqsubmenu;
    callback = cb;
    progresscallback = progresscb;
    if (menu == targetmenu){
        if (submenu == targetsubmenu){
            getdata = true;

        } else
        {
            serialPort.write('u'); // find out where we are so we get an event
        }

    } else
    {
        serialPort.write('u'); // find out where we are so we get an event

    }



}
function testcallback(d){
    console.log(JSON.stringify(d,null,4))

}
var menusys ={};

menusys['  Set Inverter     OFF SRCH ON  CHG'] = {
    menu:1,
    sub:1,
    hasdata:true,
    charlen:4
};
menusys['2  Set Generator    OFF AUTO ON  EQ '] = {
    menu:2,
    sub:1,
    hasdata:true,
    charlen:4
};

menusys['2  Gen under/over   speed           ']= {
    menu:2,
    sub:2,
    hasdata:true,
    charlen:4
};
menusys['2  Generator start  error           ']= {
    menu:2,
    sub:3,
    hasdata:true,
    charlen:4
};
menusys['2  Generator sync   error           ']= {
    menu:2,
    sub:4,
    hasdata:true,
    charlen:4
};
menusys['2  Load Amp Start   ready           ']= {
    menu:2,
    sub:5,
    hasdata:true,
    charlen:4
};
menusys['2  Voltage Start    ready           ']= {
    menu:2,
    sub:6,
    hasdata:true,
    charlen:4
};
menusys['2  Exercise Start   ready           ']= {
    menu:2,
    sub:7,
    hasdata:true,
    charlen:4
};

menusys['  Inverter/charger amps AC         ']= {
    menu:4,
    sub:1,
    hasdata:true,
    charlen:4
};
menusys['  Input            amps AC         ']= {
    menu:4,
    sub:2,
    hasdata:true,
    charlen:4
};

menusys['  Load             amps AC         ']= {
    menu:4,
    sub:3,
    hasdata:true,
    charlen:4
};
menusys['  Battery actual   volts DC        ']= {
    menu:4,
    sub:4,
    hasdata:true,
    charlen:5
};
menusys['  Battery TempComp volts DC        ']= {
    menu:4,
    sub:5,
    hasdata:true,
    charlen:5
};
menusys['  Inverter         volts AC        ']= {
    menu:4,
    sub:6,
    hasdata:true,
    charlen:4
};
menusys['  Grid (AC1)       volts AC        ']= {
    menu:4,
    sub:7,
    hasdata:true,
    charlen:4
};
menusys['  Generator (AC2)  volts AC        ']= {
    menu:4,
    sub:8,
    hasdata:true,
    charlen:4
};
menusys['  Read Frequency   Hertz           ']= {
    menu:4,
    sub:9,
    hasdata:true,
    charlen:4
};
menusys['  Over Current                     ']= {
    menu:5,
    sub:1,
    hasdata:true,
    charlen:4
};
menusys['  Transformer      overtemp        ']= {
    menu:5,
    sub:2,
    hasdata:true,
    charlen:4
};
menusys['  Heatsink         overtemp        ']= {
    menu:5,
    sub:3,
    hasdata:true,
    charlen:4
};
menusys['  High Battery     voltage         ']= {
    menu:5,
    sub:4,
    hasdata:true,
    charlen:4
};
menusys['  Low Battery      voltage         ']= {
    menu:5,
    sub:5,
    hasdata:true,
    charlen:4
};
menusys['  AC source wired  to output       ']= {
    menu:5,
    sub:6,
    hasdata:true,
    charlen:4
};
menusys['  External error   (stacked)       ']= {
    menu:5,
    sub:7,
    hasdata:true,
    charlen:4
};
menusys['  Generator start  error           ']= {
    menu:5,
    sub:8,
    hasdata:true,
    charlen:4
};
menusys['  Generator sync   error           ']= {
    menu:5,
    sub:9,
    hasdata:true,
    charlen:4
};
menusys['  Gen under/over   speed           ']= {
    menu:5,
    sub:10,
    hasdata:true,
    charlen:4
};

menusys['  Time of Day                     6']= {
    menu:6,
    sub:0,
    hasdata:true,
    charlen:9
};
menusys['  Set Clock hour                   ']= {
    menu:6,
    sub:1,
    hasdata:true,
    charlen:9
};
menusys['  Set Clock minute                 ']= {
    menu:6,
    sub:2,
    hasdata:true,
    charlen:9
};
menusys['  Set Clock second                 ']= {
    menu:6,
    sub:3,
    hasdata:true,
    charlen:4
};
menusys['  Start Quiet      time  h:m       '] = {
    menu:7,
    sub:1,
    hasdata:true,
    charlen:6
};
menusys['  End   Quiet      time  h:m       '] = {
    menu:7,
    sub:2,
    hasdata:true,
    charlen:6
};

menusys['  Set Grid Usage   FLT SELL SLT LBX'] = {
    menu:9,
    sub:1,
    hasdata:true,
    charlen:4
};
menusys['  Set Low battery  cut out VDC     '] = {
    menu:9,
    sub:2,
    hasdata:true,
    charlen:5
};
menusys['  Set LBCO delay   minutes         '] = {
    menu:9,
    sub:3,
    hasdata:true,
    charlen:4
};
menusys['  Set Low battery  cut in VDC      '] = {
    menu:9,
    sub:4,
    hasdata:true,
    charlen:5
};
menusys['  Set High battery cut out VDC     '] = {
    menu:9,
    sub:5,
    hasdata:true,
    charlen:5
};
menusys['  Set search       watts           '] = {
    menu:9,
    sub:6,
    hasdata:true,
    charlen:4
};
menusys['  Set search       spacing         '] = {
    menu:9,
    sub:7,
    hasdata:true,
    charlen:4
};
menusys['  Set Bulk         volts DC        '] = {
    menu:10,
    sub:1,
    hasdata:true,
    charlen:5
};
menusys['  Set Absorbtion   time h:m        '] = {
    menu:10,
    sub:2,
    hasdata:true,
    charlen:6
};
menusys['  Set Float        volts DC        '] = {
    menu:10,
    sub:3,
    hasdata:true,
    charlen:5
};
menusys['  Set Equalize     volts DC        '] = {
    menu:10,
    sub:4,
    hasdata:true,
    charlen:5
};
menusys['  Set Equalize     time h:m        '] = {
    menu:10,
    sub:5,
    hasdata:true,
    charlen:6
};
menusys['  Set Max Charge   amps  AC        '] = {
    menu:10,
    sub:6,
    hasdata:true,
    charlen:4
};
menusys['  Set Temp Comp    LeadAcid NiCad  '] = {
    menu:10,
    sub:7,
    hasdata:true,
    charlen:4
};

menusys['  Set Grid (AC1)   amps AC         '] = {
    menu:11,
    sub:1,
    hasdata:true,
    charlen:4
};

menusys['  Set Gen (AC2)    amps  AC        '] = {
    menu:11,
    sub:2,
    hasdata:true,
    charlen:4
};

menusys['  Set Input lower  limit VAC       '] = {
    menu:11,
    sub:3,
    hasdata:true,
    charlen:4
};

menusys['  Set Input upper  limit VAC       '] = {
    menu:11,
    sub:4,
    hasdata:true,
    charlen:4
};

menusys['  Set Load Start   amps AC         '] = {
    menu:12,
    sub:1,
    hasdata:true,
    charlen:4
};

menusys['  Set Load Start   delay min       '] = {
    menu:12,
    sub:2,
    hasdata:true,
    charlen:5
};
menusys['  Set Load Stop    delay min       '] = {
    menu:12,
    sub:3,
    hasdata:true,
    charlen:5
};
menusys['  Set 24 hr start  volts DC        '] = {
    menu:12,
    sub:4,
    hasdata:true,
    charlen:5
};
menusys['  Set 2  hr start  volts DC        '] = {
    menu:12,
    sub:5,
    hasdata:true,
    charlen:5
};
menusys['  Set 15 min start volts DC        '] = {
    menu:12,
    sub:6,
    hasdata:true,
    charlen:5
};
menusys['  Read LBCO 30 sec start VDC       '] = {
    menu:12,
    sub:7,
    hasdata:true,
    charlen:5
};
menusys['  Read LBCO 30 sec start VDC       '] = {
    menu:12,
    sub:8,
    hasdata:true,
    charlen:5
};
menusys['  Set Exercise     period days     '] = {
    menu:12,
    sub:9,
    hasdata:true,
    charlen:4
};
menusys['  Set RY7 Function GlowStop Run    '] = {
    // cant tell position of this one????
    // no data being sent
    menu:13,
    sub:1,
    hasdata:true,
    charlen:4
};
menusys['  Set Gen warmup   seconds         '] = {
    menu:13,
    sub:2,
    hasdata:true,
    charlen:4
};
menusys['  Set Pre Crank    seconds         '] = {
    menu:13,
    sub:3,
    hasdata:true,
    charlen:4
};
menusys['  Set Max Cranking seconds         '] = {
    menu:13,
    sub:4,
    hasdata:true,
    charlen:4
};
menusys['  Set Post Crank   seconds         '] = {
    menu:13,
    sub:5,
    hasdata:true,
    charlen:4
};
menusys['  Set Relay 9      volts DC        '] = {
    menu:14,
    sub:1,
    hasdata:true,
    charlen:5
};
menusys['  R9 Hysteresis    volts DC        '] = {
    menu:14,
    sub:2,
    hasdata:true,
    charlen:5
};
menusys['  Set Relay 10     volts DC        '] = {
    menu:14,
    sub:3,
    hasdata:true,
    charlen:5
};
menusys['  R10 Hysteresis   volts DC        '] = {
    menu:14,
    sub:4,
    hasdata:true,
    charlen:5
};
menusys['  Set Relay 11     volts DC        '] = {
    menu:14,
    sub:5,
    hasdata:true,
    charlen:5
};
menusys['  R11 Hysteresis   volts DC        '] = {
    menu:14,
    sub:6,
    hasdata:true,
    charlen:5
};
menusys['  Set Start Bulk   time            '] = {
    menu:15,
    sub:1,
    hasdata:true,
    charlen:6
};

menusys['  Set Low Battery  transferVDC     '] = {
    menu:16,
    sub:1,
    hasdata:true,
    charlen:5
};
menusys['  Set Low battery  cut in  VDC     '] = {
    menu:16,
    sub:2,
    hasdata:true,
    charlen:5
};
menusys['  Set Battery Sell volts DC        '] = {
    menu:17,
    sub:1,
    hasdata:true,
    charlen:5
};
menusys['  Set Max Sell     amps AC         '] = {
    menu:17,
    sub:2,
    hasdata:true,
    charlen:4
};
menusys['  Set Start Charge time            '] = {
    menu:18,
    sub:1,
    hasdata:true,
    charlen:6
};
menusys['  Set End Charge   time            '] = {
    menu:18,
    sub:1,
    hasdata:true,
    charlen:6
};
