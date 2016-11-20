var thisthing = {
    type:"solar",
    id: witzyname+'-sw5548',
    name: 'sw5548 Battery Inverter',
    ipaddress:localaddress+':'+settings.options.webserver.listenport,
    parent:witzyname,
    parenttype:'witzy',
    events:[
        {name:'targetValueGet',values:'STRING',
            description:'Received a value (based on menu and submenu)'},
        {name:'targetValueSet',values:'Set',description:'A target value was reached'},
        {name:'swData',values:'Number',description:'Output Watts and all details'}
    ]
    // commands:[
    //     {name:'stripSetColor',
    //         sendto:"witzy",
    //         device:'sw5548',
    //         command:'stripSetColor',
    //         arguments:{name:'JSON',
    //             color:{type:'input type = color',defaultvalue:'#ff00ff'},}
    //     }]

}
ll.writething(thisthing,true);
setInterval(function(){
    if (submenu == 0 && targetmenu == 0){
        serialPort.write('/');
    }

},5000)
setInterval(function(){
  if (!targetmenu && !targetsubmenu && !targetvalue)
    exports.sampleMenu4();
},180000);
var com = require('serialport');
//openSerialPort('/dev/ttyS0');
exports.start = function(scb){

    openSerialPort('/dev/ttyUSB0',scb);

}

var sbuffer = '';
var menu = 0;
var submenu = 0;
var display = '';
var t;
var data;
var targetmenu = 0;
var targetsubmenu = 0;
var targetvalue = null;
var getdata = false;
var callback ;
var progresscallback;
var oktosend = false;
var serialPort;
var samples = 1;
var sample =[];
var skipledsample = false; // first sample after a move is milling the flashing leds

var leds = {
    utilityPower:null,
    generatorPower:null,
    inverting:null,
    linetie:null,
    float:null,
    bulk:null,
    error:null,
    overcurrent:null,
    utilityPowerSyncing:null,
    generatorPowerSyncing:null,
};
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
                if (skipledsample == true){
                    skipledsample = false;
                    return
                };

                // leds
                if (sbuffer.indexOf('\r\n\r\n') != -1){
                    leds.buffer = sbuffer;
                    sbuffer = sbuffer.replace('\r\n\r\n','');
                    sbuffer = sbuffer.replace('UNIT1','')
                    var flashing = sbuffer.substr(0,sbuffer.indexOf('  '));
                    var onleds = sbuffer.substr(sbuffer.indexOf('  ')+2);
                    // this is going to be ugly - best guess at led states
                    var temp = true;
                    if (onleds.indexOf('LT') == -1){temp = false;}
                    if (leds.linetie != temp ){
                        leds.linetie = temp;
                        server.send({event:{id:thisthing.id,event:'linetie',value:temp,eventdata:{leds},source:thisthing.id}});
                    }

                    var temp = true;
                    if (onleds.indexOf('BK') == -1){temp = false;}
                    if (leds.bulk != temp ){
                      leds.bulk = temp;
                      server.send({event:{id:thisthing.id,event:'bulk',value:temp,eventdata:{leds},source:thisthing.id}});
                    }
                    var temp = true;
                    if (onleds.indexOf('IN') == -1){temp = false;}
                    if (leds.inverting != temp ){
                        leds.inverting = temp;
                        server.send({event:{id:thisthing.id,event:'inverting',value:temp,eventdata:{leds},source:thisthing.id}});
                    }
                    var temp = true;
                    if (onleds.indexOf('FL') == -1){temp = false;}
                    if (leds.float != temp ){
                        leds.float = temp;
                        server.send({event:{id:thisthing.id,event:'float',value:temp,eventdata:{leds},source:thisthing.id}});
                    }

                    var temp = true;
                    if (onleds.indexOf('OC') == -1){temp = false;}
                    if (leds.overcurrent != temp ){
                        leds.overcurrent = temp;
                        server.send({event:{id:thisthing.id,event:'overcurrent',value:temp,eventdata:{leds},source:thisthing.id}});
                    }

                    var temp = true;
                    if (sbuffer.indexOf('ER') == -1){temp = false;}
                    if (leds.error != temp ){
                        leds.error = temp;
                        server.send({event:{id:thisthing.id,event:'error',value:temp,eventdata:{leds},source:thisthing.id}});
                    }
                    var temp = true;
                    if (flashing.indexOf('A2') == -1){temp = false;}
                    if (leds.generatorPowerSyncing != temp ){
                        leds.generatorPowerSyncing = temp;
                        server.send({event:{id:thisthing.id,event:'generatorPowerSyncing',value:temp,eventdata:{leds},source:thisthing.id}});
                        if (temp == true){
                            // turn thisone off - cannot both be on
                            if (leds.generatorPower == true){
                                server.send({event:{id:thisthing.id,event:'generatorPower',value:false,eventdata:{leds},source:thisthing.id}});
                            }
                            leds.generatorPower = false

                        } else
                        {
                            var temp = true;
                            if (onleds.indexOf('A2') == -1){temp = false;}
                            if (leds.generatorPower != temp ){
                                leds.generatorPower = temp;
                                server.send({event:{id:thisthing.id,event:'generatorPower',value:temp,eventdata:{leds},source:thisthing.id}});
                            }
                        }
                    }
                    if (flashing.indexOf('A1') == -1){temp = false;}
                    if (leds.utilityPowerSyncing != temp ){
                        leds.utilityPowerSyncing = temp;
                        server.send({event:{id:thisthing.id,event:'utilityPowerSyncing',value:temp,eventdata:{leds},source:thisthing.id}});
                        if (temp == true){
                            // turn thisone off - cannot both be on
                            if (leds.utilityPower == true){
                                server.send({event:{id:thisthing.id,event:'utilityPower',value:false,eventdata:{leds},source:thisthing.id}});
                            }
                            leds.utilityPower = false
                        } else
                        {
                            var temp = true;
                            if (onleds.indexOf('A1') == -1){temp = false;}
                            if (leds.utilityPower != temp ){
                                leds.utilityPower = temp;
                                server.send({event:{id:thisthing.id,event:'utilityPower',value:temp,eventdata:{leds},source:thisthing.id}});
                            }
                        }

                    }

                    console.log('Flashing:'+flashing)
                    console.log('leds:'+onleds)
                    websock.send(JSON.stringify({object:"displayleds",data:{value:sbuffer}}),'trace');

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
                //console.log(display+'*');
                if (sbuffer.substr(startchar+35,2) > 0){
                    // we are in a main menu
                    menu = Number(sbuffer.substr(startchar+35,2));
                    submenu = 0; // if we are in a submenu this is replaced

                }

                sbuffer = sbuffer.substr(startchar+37,2);
                if (sbuffer.length > 0){
                    console.log('chars remaining'+sbuffer.length)
                }

                if (menusys[display]){
                    // found the data in the menusys object
                    oktosend = true; // holy crap - so we have to wait until our change gets acked with a new screen dump before the value changes and we can chaange again
                    menusys[display].data = null;

                    // fix for duplicate items
                    if (menu == 2 &&  menusys[display].menu == 5){
                        display = '2'+display;
                    }
                    menu = menusys[display].menu;
                    submenu = menusys[display].sub;
                } else
                {
                    console.log(display+'*');

                }

                clearTimeout(t);
                // ok - we know where we are check if its where we want to be
                console.log('menu:'+menu+':'+submenu+ '  --  '+targetmenu+':'+targetsubmenu);
                websock.send(JSON.stringify({object:"displaytext",data:{menu:menu,submenu:submenu,text1:display}}),'trace');

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
            var o = menusys[display];
            if (o && o.hasdata ){
                if (sbuffer.length >= o.charlen+sbuffer.indexOf(' ')){ // have all the data in the buffer
                    // make sure the first char is a space
                    data = sbuffer.substr(sbuffer.indexOf(' '), o.charlen)
                    sbuffer = sbuffer.substr(o.charlen+1+sbuffer.indexOf(' '))
                    //data = checkdata(menu,submenu,data);
                 //   data = data.replace(/ /g,''); // get rid of spaces

                    //console.log('data:'+data)

                    if (data.length >0){

                        // validate data
                        if (o.datatype){
                            switch (o.datatype){
                                case "list":

                                       data = data.replace(/ /g,''); // get rid of spaces

                                    if (o.values[data]){  // the data we recieved is in the list
                                        // good data


                                        // maybe we should adjust the data here
                                        if (targetvalue && o.canedit && targetmenu == 0 && targetsubmenu == 0){ // there is a target value and we are at the right place
                                            if (!o.values[targetvalue]){ // and it is valid
                                                console.log("TARGET VALUE invalid:"+targetvalue)
                                                targetvalue = null

                                            } else if (targetvalue == data){
                                                console.log('At target value')
                                                targetvalue = null;
                                                server.send({event:{
                                                    id:thisthing.id,
                                                    event:'targetValueSet',
                                                    value:data,
                                                    eventdata:{menu:menu,
                                                        submenu:submenu,
                                                        value:data,
                                                        display:display,
                                                        leds:leds
                                                    },
                                                    source:thisthing.id

                                                }});

                                                callback({menu:menu,
                                                    submenu:submenu,
                                                    value:data,
                                                    display:display})
                                                serialPort.write('r');

                                            } else
                                            {
                                                if (oktosend){
                                                    oktosend = false;
                                                    // and we are not at the valid target value
                                                    if (o.values[data] > o.values[targetvalue]){
                                                        // decrease
                                                        console.log('dec')
                                                        serialPort.write('-');
                                                    }    else
                                                    {
                                                        console.log('inc')
                                                        serialPort.write('+');
                                                    }
                                                }
                                            }
                                        }
                                        //console.log('valid data')
                                        // valid data
                                        console.log(display+':'+data)
                                    }else
                                    {
                                        if (data.length > 0){
                                            console.log('invalid data value:'+data);
                                        }


                                        data = null
                                    }
                                    break;
                                case 'time10':
                                    var savedata = data;
                                    data = validatetime10(data);
                                    if (data != null){
                                        // good data
                                        // valid data
                                        console.log(display+':'+data)
                                       if (targetvalue && o.canedit){
                                            targetvalue=validatetime10(targetvalue)
                                            if (targetvalue && o.canedit && targetmenu == 0 && targetsubmenu == 0){ // there is a target value and we are at the right place
                                                //if (targetvalue){
                                                if (targetvalue == data){
                                                    console.log('At target value')
                                                    targetvalue = null
                                                    server.send({event:{
                                                        id:thisthing.id,
                                                        event:'targetValueSet',
                                                        value:data,
                                                        eventdata:{menu:menu,
                                                            submenu:submenu,
                                                            value:data,
                                                            display:display,
                                                            leds:leds
                                                        },
                                                        source:thisthing.id

                                                    }});

                                                    callback({menu:menu,
                                                        submenu:submenu,
                                                        value:data,
                                                        display:display})

                                                } else
                                                {
                                                    // and we are not at the valid target value
                                                    if (oktosend){
                                                        oktosend = false;
                                                        if (data > targetvalue){
                                                            // decrease
                                                            console.log('dec')
                                                            serialPort.write('-');
                                                        }    else
                                                        {
                                                            console.log('inc')
                                                            serialPort.write('+');
                                                        }
                                                    }
                                                }
                                            }else
                                            {console.log ('invalid target value(time10):'+targetvalue)
                                                targetvalue = null;

                                            }
                                        }

                                    }else{
                                        console.log('invalid data value:'+savedata);
                                        data = null
                                    }
                                    break;
                                case 'range':
                                    var savedata = data;

                                    //if ((data*10)%(o.step*10) == 0 && data >= o.low && data <=o.high){
                                    if ( data >= o.low && data <=o.high){
                                    // good data
                                        // valid data
                                        console.log(display+':'+data)
                                        if (targetvalue && o.canedit){
                                            if (o.canedit && targetmenu == 0 && targetsubmenu == 0){ // there is a target value and we are at the right place
                                                if ((targetvalue*10)%(o.step*10) == 0 && targetvalue >= o.low && targetvalue <= o.high  ){
                                                    if (targetvalue == Number(data)){
                                                        console.log('At target value')
                                                        targetvalue = null
                                                        server.send({event:{
                                                            id:thisthing.id,
                                                            event:'targetValueSet',
                                                            value:data,
                                                            eventdata:{menu:menu,
                                                                submenu:submenu,
                                                                value:data,
                                                                display:display,
                                                                leds:leds
                                                            },
                                                            source:thisthing.id

                                                        }});

                                                        callback({menu:menu,
                                                            submenu:submenu,
                                                            value:data,
                                                            display:display})


                                                    } else
                                                    {
                                                        // and we are not at the valid target value
                                                        if (oktosend){
                                                            oktosend = false;
                                                            if (Number(data) > targetvalue){
                                                                // decrease
                                                                console.log('dec')
                                                                serialPort.write('-');
                                                            }    else
                                                            {
                                                                console.log('inc')
                                                                serialPort.write('++');
                                                            }
                                                        }
                                                    }
                                                }else
                                                {console.log ('invalid target value:'+targetvalue)
                                                    targetvalue = null;
                                                }

                                            }

                                            //if (targetvalue){

                                        }

                                    }else{
                                        if (data.length > 0){
                                            console.log('invalid data value:'+savedata);
                                        }

                                        data = null
                                    }
                                    break;

                            }


                        }

                        if (getdata  && data != null && isNaN(Number(data)) == false){

                            samples -= 1;
                            sample.push(Number(data));

                            if (samples < 1){
                                var total = 0;
                                for (var i = 0; i < sample.length; i++) {
                                total += sample[i];
                                }
                                console.log('total:'+total)
                                data = total/sample.length;
                                var samplelength = sample.length;
                                samples = 1;
                                sample = [];

                                getdata = false;
                                if (menu != 4){

                                    server.send({event:{
                                        id:thisthing.id,
                                        event:'targetValueGet',
                                        value:data,
                                        eventdata:{menu:menu,
                                            submenu:submenu,
                                            value:data,
                                            display:display,
                                            leds:leds
                                        },
                                        source:thisthing.id

                                    }});

                                }else
                                {
                                    console.log('\r Menu'+menu+':'+submenu+' sampled('+samplelength+') '+data)
                                }
                                if (callback){
                                    callback({menu:menu,
                                        submenu:submenu,
                                        value:data,
                                        display:display})

                                }
                            } else
                            {
                                process.stdout.write('-');

                            }


                        }
                        if (typeof(data) == 'string'){
                            data = data.replace(' ','');
                        }


                        if (data && o.data != data){
                         //   console.log(display+'*Data:'+data)
                            o.data = data;
                            websock.send(JSON.stringify({object:"displayvalue",data:{value:data}}),'trace');

                        }


                    }

                    if (sbuffer.length != 0 ){
                        console.log('more'+sbuffer.length)
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
     targetmenu = 0;
     targetsubmenu = 0;
     targetvalue = null;
     getdata = false;
     callback = null ;
     oktosend = false;
     samples = 1;
     sample =[];
    serialPort.write(data,function(err, results)
    {
        if (err){console.log('sw comm write error:'+err)}//else{console.log('sw write:'+data)}
    });
};

exports.goInverterValue = function(reqmenu,reqsubmenu,cb,progresscb){
    targetmenu = reqmenu;
    targetsubmenu = reqsubmenu;
    samples = 1;
    callback = cb;
    progresscallback = progresscb;
    if (menu == targetmenu){
        if (submenu == targetsubmenu){
            getdata = true;

        } else
        {
            serialPort.write('d'); // find out where we are so we get an event
        }

    } else
    {
        serialPort.write('u'); // find out where we are so we get an event

    }



}
exports.getInverterValue = function(reqmenu,reqsubmenu,reqsamples,cb,progresscb){
    skipledsample = true;
    targetmenu = reqmenu;
    targetsubmenu = reqsubmenu;
    samples = reqsamples;
    callback = cb;
    progresscallback = progresscb;
    if (menu == targetmenu){
        if (submenu == targetsubmenu){
            getdata = true;

        } else
        {
            serialPort.write('d'); // find out where we are so we get an event
        }

    } else
    {
        serialPort.write('u'); // find out where we are so we get an event

    }



}
exports.setInverterValue = function(reqmenu,reqsubmenu,reqvalue,cb,progresscb){
    skipledsample = true;
    targetmenu = reqmenu;
    targetsubmenu = reqsubmenu;
    targetvalue = reqvalue;
    callback = cb;
    progresscallback = progresscb;
    samples = 1;

    if (menu == targetmenu){
        if (submenu == targetsubmenu){
            getdata = true;

        } else
        {
            serialPort.write('d'); // find out where we are so we get an event
        }

    } else
    {
        serialPort.write('u'); // find out where we are so we get an event

    }



}
exports.testcallback = function (d){
    console.log(JSON.stringify(d,null,4))

};
exports.sampleMenu4 = function(){
var o={};
exports.getInverterValue(4,1,15,function(x){
    o.chargerAmps = x.value;
    exports.getInverterValue(4,2,35,function(x){
       o.inputAmps = x.value
        exports.getInverterValue(4,3,35,function(x){
            o.outputAmps = x.value;
            exports.getInverterValue(4,4,15,function(x){
                o.batteryVolts = x.value;
                exports.getInverterValue(4,5,1,function(x){
                    o.batteryVoltsTempComp = x.value;
                    exports.getInverterValue(4,6,1,function(x){
                        o.inverterVolts = x.value;
                        exports.getInverterValue(4,7,1,function(x){
                            o.gridVolts = x.value;
                            exports.getInverterValue(4,8,1,function(x){
                                o.generatorVolts = x.value;
                                exports.getInverterValue(4,9,1,function(x){
                                    o.freq = x.value;
                                    o.chargerWatts = o.chargerAmps*o.batteryVolts;
                                    o.inputWatts = o.inputAmps*o.gridVolts;
                                    o.outputWatts = o.outputAmps*o.inverterVolts;
                                    console.log(JSON.stringify(o,null,4));
                                    serialPort.write('r'); // reset to the top
                                    o.leds = leds;
                                    server.send({event:{
                                        id:thisthing.id,
                                        event:'swData',
                                        value:o.outputWatts,
                                        eventdata:o,
                                        source:thisthing.id
                                    }});

                                })

                            })

                        })
                    })
                })
            })
        })
    })

})


}

var menusys ={};
menusys['  Set Inverter     OFF SRCH ON  CHG'] = {
    menu:1,
    sub:1,
    hasdata:true,
    charlen:4
};
menusys['  Set Generator    OFF AUTO ON  EQ '] = {
    menu:2,
    sub:1,
    hasdata:true,
    charlen:4,
    canedit:true,
    datatype:'list',
    values:{'OF':1,'AU':2,'ON':3,'EQ':4}
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
menusys['  Load Amp Start   ready           ']= {
    menu:2,
    sub:5,
    hasdata:true,
    charlen:4
};
menusys['  Voltage Start    ready           ']= {
    menu:2,
    sub:6,
    hasdata:true,
    charlen:4
};
menusys['  Exercise Start   ready           ']= {
    menu:2,
    sub:7,
    hasdata:true,
    charlen:4
};

menusys['  Inverter/charger amps AC         ']= {
    menu:4,
    sub:1,
    hasdata:true,
    charlen:4,


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
    charlen:6,
    canedit:true,
    datatype:'time10'

};
menusys['  End   Quiet      time  h:m       '] = {
    menu:7,
    sub:2,
    hasdata:true,
    charlen:6,
    canedit:true,
    datatype:'time10'
};

menusys['  Set Grid Usage   FLT SELL SLT LBX'] = {
    menu:9,
    sub:1,
    hasdata:true,
    charlen:4,
    canedit:true,
    datatype:'list',
    values:{'FL':1,'SE':2,'SL':3,'LB':4}
};
menusys['  Set Low battery  cut out VDC     '] = {
    menu:9,
    sub:2,
    hasdata:true,
    charlen:5,
    canedit:true,
    datatype:'range',
    high:70,
    low:32,
    step:.2
};
menusys['  Set LBCO delay   minutes         '] = {
    menu:9,
    sub:3,
    hasdata:true,
    charlen:4,
    canedit:true,
    datatype:'range',
    high:255,
    low:0,
    step:1,
    default:15

};
menusys['  Set Low battery  cut in VDC      '] = {
    menu:9,
    sub:4,
    hasdata:true,
    charlen:5,
    canedit:true,
    datatype:'range',
    high:70,
    low:20,
    step:.2,
    default:52
};
menusys['  Set High battery cut out VDC     '] = {
    menu:9,
    sub:5,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:66,
    low:0,
    step:.2,
    default:64
};
menusys['  Set search       watts           '] = {
    menu:9,
    sub:6,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:240,
    low:0,
    step:16,
    default:48
};
menusys['  Set search       spacing         '] = {
    menu:9,
    sub:7,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:255,
    low:10,
    step:1,
    default:59
};
menusys['  Set Bulk         volts DC        '] = {
    menu:10,
    sub:1,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:64,
    low:40,
    step:.2,
    default:57.6
};
menusys['  Set Absorbtion   time h:m        '] = {
    menu:10,
    sub:2,
    hasdata:true,
    charlen:6,
    datatype:'time10',
    canedit:true,
    default:'02:00'
};
menusys['  Set Float        volts DC        '] = {
    menu:10,
    sub:3,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:64,
    low:40,
    step:.2,
    default:53.6
};
menusys['  Set Equalize     volts DC        '] = {
    menu:10,
    sub:4,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:64,
    low:40,
    step:.2,
    default:57.6
};
menusys['  Set Equalize     time h:m        '] = {
    menu:10,
    sub:5,
    hasdata:true,
    charlen:6,
    datatype:'time10',
    canedit:true,
    default:'02:00'
};
menusys['  Set Max Charge   amps  AC        '] = {
    menu:10,
    sub:6,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:35,
    low:1,
    step:1,
    default:30
};
menusys['  Set Temp Comp    LeadAcid NiCad  '] = {
    menu:10,
    sub:7,
    hasdata:true,
    charlen:4,
    canedit:true,
    datatype:'list',
    values:{'LA':1,'NC':2},
    default:'LE'
};

menusys['  Set Grid (AC1)   amps AC         '] = {
    menu:11,
    sub:1,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:63,
    low:0,
    step:1,
    default:60
};

menusys['  Set Gen (AC2)    amps  AC        '] = {
    menu:11,
    sub:2,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:63,
    low:0,
    step:1,
    default:30
};

menusys['  Set Input lower  limit VAC       '] = {
    menu:11,
    sub:3,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:111,
    low:80,
    step:1,
    default:108
};

menusys['  Set Input upper  limit VAC       '] = {
    menu:11,
    sub:4,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:149,
    low:128,
    step:1,
    default:132
};

menusys['  Set Load Start   amps AC         '] = {
    menu:12,
    sub:1,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:63,
    low:0,
    step:1,
    default:33
};

menusys['  Set Load Start   delay min       '] = {
    menu:12,
    sub:2,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:25.5,
    low:0,
    step:.1,
    default:5
};
menusys['  Set Load Stop    delay min       '] = {
    menu:12,
    sub:3,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:25.5,
    low:0,
    step:.1,
    default:5
};
menusys['  Set 24 hr start  volts DC        '] = {
    menu:12,
    sub:4,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:71,
    low:20,
    step:.2,
    default:49.2
};
menusys['  Set 2  hr start  volts DC        '] = {
    menu:12,
    sub:5,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:71,
    low:20,
    step:.2,
    default:47.2
};
menusys['  Set 15 min start volts DC        '] = {
    menu:12,
    sub:6,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:71,
    low:20,
    step:.2,
    default:45.2

};
menusys['  Read LBCO 30 sec start VDC       '] = {
    menu:12,
    sub:7,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:71,
    low:20,
    step:.2,
    default:44

};

menusys['  Set Exercise     period days     '] = {
    menu:12,
    sub:8,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:255,
    low:0,
    step:1,
    default:30

};
menusys['  Set RY7 Function GlowStop Run    '] = {
    // cant tell position of this one????
    // no data being sent
    menu:13,
    sub:1,
    hasdata:true,
    charlen:4,
    canedit:true,
    datatype:'list',
    values:{'GL':1,'RU':2},
    default:'RU'
};
menusys['  Set Gen warmup   seconds         '] = {
    menu:13,
    sub:2,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:255,
    low:16,
    step:1,
    default:60
};
menusys['  Set Pre Crank    seconds         '] = {
    menu:13,
    sub:3,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:255,
    low:0,
    step:1,
    default:10
};
menusys['  Set Max Cranking seconds         '] = {
    menu:13,
    sub:4,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:15,
    low:0,
    step:1,
    default:10
};
menusys['  Set Post Crank   seconds         '] = {
    menu:13,
    sub:5,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:255,
    low:16,
    step:1,
    default:30
};
menusys['  Set Relay 9      volts DC        '] = {
    menu:14,
    sub:1,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:71,
    low:20,
    step:.2,
    default:58
};
menusys['  R9 Hysteresis    volts DC        '] = {
    menu:14,
    sub:2,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:26.5,
    low:.2,
    step:.2,
    default:4
};
menusys['  Set Relay 10     volts DC        '] = {
    menu:14,
    sub:3,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:71,
    low:20,
    step:.2,
    default:59
};
menusys['  R10 Hysteresis   volts DC        '] = {
    menu:14,
    sub:4,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:26.5,
    low:.2,
    step:.2,
    default:4
};
menusys['  Set Relay 11     volts DC        '] = {
    menu:14,
    sub:5,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:71,
    low:20,
    step:.2,
    default:60
};
menusys['  R11 Hysteresis   volts DC        '] = {
    menu:14,
    sub:6,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:26.5,
    low:.2,
    step:.2,
    default:4
};
menusys['  Set Start Bulk   time            '] = {
    menu:15,
    sub:1,
    hasdata:true,
    charlen:6,
    datatype:'time10',
    canedit:true,
    default:'0:00'
};

menusys['  Set Low Battery  transferVDC     '] = {
    menu:16,
    sub:1,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:66,
    low:20,
    step:.2,
    default:45.2
};
menusys['  Set Low battery  cut in  VDC     '] = {
    menu:16,
    sub:2,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:71,
    low:20,
    step:.2,
    default:52
};
menusys['  Set Battery Sell volts DC        '] = {
    menu:17,
    sub:1,
    hasdata:true,
    charlen:5,
    datatype:'range',
    canedit:true,
    high:64,
    low:20,
    step:.2,
    default:53.6
};
menusys['  Set Max Sell     amps AC         '] = {
    menu:17,
    sub:2,
    hasdata:true,
    charlen:4,
    datatype:'range',
    canedit:true,
    high:35,
    low:1,
    step:1,
    default:30
};
menusys['  Set Start Charge time            '] = {
    menu:18,
    sub:1,
    hasdata:true,
    charlen:6,
    datatype:'time10',
    canedit:true,
    default:'21:00'
};
menusys['  Set End Charge   time            '] = {
    menu:18,
    sub:1,
    hasdata:true,
    charlen:6,
    datatype:'time10',
    canedit:true,
    default:'21:00'
};
function validatetime10(x){
    if (Number.isInteger(x)){
        return x

    }

    if (x.length != 5 ){
        return null

    }
    x=x.replace(':',' ').match(/\S+/g)
    if (x[0] >= 0 && x[0] < 24 && x[1] >= 0 && x[1] <= 50 && x[1]%10 == 0){
        return Number(x[0]+x[1]);
    }else
    {
        return null;
    }}