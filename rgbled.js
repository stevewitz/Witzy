var debug = 1;
var console = {};
var os = require('os');
var colorbuffer = {};
var rgbBuffer = {};
var rgbBufferTemp = {};
var walkInterval=0;
var intervalMS = 100;
var directionRight = 'true';
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('red','rgb ') + x + '\n');}}})();

if(os.type() != "Windows_NT") {
    var ws281x = require('rpi-ws281x-native/lib/ws281x-native');
}
/**
 * Created by steve on 9/9/2016. A
 */
//open spi port
//var numberLEDS = 50; // set this global in app

var x = settings.hardware.rgbled[0];
    //settings.hardware.rgbled.forEach(function(x,index){
    colorbuffer[x.name]  = new Uint32Array(x.leds);
    rgbBuffer[x.name] = new Array(x.leds*3).fill(0); //declare array and initialize it
    rgbBufferTemp[x.name] = new Array(x.leds*3).fill(0); //declare array and initialize it

    if(os.type() != "Windows_NT") {
        ws281x.init(x.leds);
    }
// create or update the devices in things
    if (x.createdevice){
        var device ={
            type:"rbgledsegment",
            id: witzyname+'-'+x.name,
            name: x.name,
            ipaddress:localaddress+':'+settings.options.webserver.listenport,
            parent:witzyname,
            parenttype:'witzy',
            startLed:1,
            endLed:x.leds,
            stripname:x.name,
            commands:[
                {name:'stripSetColor',
                    sendto:"witzy",
                    command:'stripSetColor',
                    arguments:{name:'NUMBER'}
                },
                {name:'colorFade',
                    sendto:"witzy",
                    command:'colorFade',
                    arguments:{name:'JSON',
                              endColor:0xff0000,
                              fadeTimeSeconds:10}
                },
                {name:'simpleFade',
                    sendto:"witzy",
                    command:'simpleFade',
                    arguments:{name:'JSON',
                        fadeLevel:0.5,
                        fadeTimeSeconds:10}
                },
                {name:'Blackout',
                    sendto:"witzy",
                    command:'Blackout'

                },
                {name:'AllOn',
                    sendto:"witzy",
                    command:'AllOn',
                    arguments:{name:'NUMBER'}
                },
                {name:'bubbleWalk',
                    sendto:"witzy",
                    command:'bubbleWalk',
                    arguments:{name:'JSON',
                        numLEDs:5,
                        directionRight:'true',
                        intervalMS:100,
                        color:0xff0000}
                },
                {name:'twoWayWalk',
                    sendto:"witzy",
                    command:'twoWayWalk',
                    arguments:{name:'JSON',
                        numLEDs:5,
                        intervalMS:100,
                        color:0xff0000}
                },
                {name:'rainbow',
                    sendto:"witzy",
                    command:'rainbow',
                    arguments:{name:'JSON',
                        numEachColor:1}

                }

            ]
        }
        ll.writething(device,true)

}


    //});
exports.incommand = function(c){
    //console.log(JSON.stringify(c,null,4))
    clearInterval(walkInterval);// stop any walk timers that may be set
    switch (c.command){
        case "stripSetColor":
            stripSetColor(c.obj,c.value);
            break;
        case "colorFade":
            colorFade(c.obj,c.value);
            break;
        case "simpleFade":
            simpleFade(c.obj,c.value);
            break;
        case "Blackout":
            stripSetColor(c.obj,0);
            break;
        case "AllOn":
            stripSetColor(c.obj,0xFFFFFF);
            break;
        case "bubbleWalk":
            bubbleWalk(c.obj,c.value);
            break;
        case "twoWayWalk":
            twoWayWalk(c.obj,c.value);
            break;
        case "rainbow":
            rainbow(c.obj,c.value);
            break;
    }
}

function stripSetColor (o,value){ // first led is led 1  //
    console.log(o.startLed+':'+o.endLed);
    //set rgbbuffer to color from value
    var startLED = o.startLed;
    var endLed = o.endLed;
    var newColor = parseColorToRGB(value)
    red = newColor[0];
    green = newColor[1];
    blue = newColor[2];
    for(var i = (startLED-1)*3; i < (endLed)*3; i+=3){
        rgbBuffer[o.stripname][i] = red;
        rgbBuffer[o.stripname][i+1] = green;
        rgbBuffer[o.stripname][i+2] = blue;
    }
    updatestrip(o, rgbBuffer[o.stripname]);
}

function simpleFade(o, value){// fades up or down. Fade level is between 0 and 1 with 1 being all bright.  50% level is .5
    var count = 0;
    var startLED = o.startLed;
    var endLed = o.endLed;
    var fadeTime = value.fadeTimeSeconds;
    var fadeLevel = value.fadeLevel;
    var intervalTime = parseInt((fadeTime *1000)/255);

    for(var i = (o.startLed-1)*3; i < (o.endLed)*3; i++){
        rgbBufferTemp[o.stripname][i] = rgbBuffer[o.stripname][i]*parseFloat(fadeLevel); //store final fade values
    }

    var simpleFadeInterval = setInterval(function(){
        count +=1;
        if(count >=  254){
            clearInterval(simpleFadeInterval);
        }
        for(var i = (startLED-1)*3; i < (endLed)*3; i++){
            rgbBuffer[o.stripname][i] = rgbBuffer[o.stripname][i]-((rgbBuffer[o.stripname][i]-rgbBufferTemp[o.stripname][i])/(255-count));
        }
        updatestrip(o, rgbBuffer[o.stripname]); //bring back buffer to output
    },intervalTime);
}

function colorFade(o,value){ // fades up or down automatically
    console.log('value:'+JSON.stringify(value,null,4))
  //  return
    // i dont think you can do it this way
    // i think you have to calculate the stepsize for each led

    var count = 0;
    var startLED = o.startLed;
    var endLed = o.endLed;
    var fadeTime = value.fadeTimeSeconds;
    var newColor = parseColorToRGB(value.endColor)
    red = newColor[0];
    green = newColor[1];
    blue = newColor[2];

    var intervalTime = parseInt((fadeTime *1000)/255);

    var simpleFadeInterval = setInterval(function(){
        count +=1;
        if(count >= 254){
            clearInterval(simpleFadeInterval);
        }
        for(var i = (startLED-1)*3; i < (endLed)*3; i+=3){
            rgbBuffer[o.stripname][i] = rgbBuffer[o.stripname][i]-((rgbBuffer[o.stripname][i]-red)/(255-count));
            rgbBuffer[o.stripname][i+1] = rgbBuffer[o.stripname][i+1]-((rgbBuffer[o.stripname][i+1]-green)/(255-count));
            rgbBuffer[o.stripname][i+2] = rgbBuffer[o.stripname][i+2]-((rgbBuffer[o.stripname][i+2]-blue)/(255-count));
        }
        updatestrip(o, rgbBuffer[o.stripname]); //bring back buffer to output

    },intervalTime);
}


function bubbleWalk(o,value){
    var newColor = parseColorToRGB(value.color);
    var counter = 0;
    red = newColor[0];
    green = newColor[1];
    blue = newColor[2];
    var middle = 0;

    clearInterval(walkInterval);
    intervalMS = parseFloat(value.intervalMS);
    var numLEDS = parseInt(value.numLEDs);
    directionRight = value.directionRight;

    if(numLEDS % 2 == 0){ //make suer num leds is an odd number so there is a middle value
        numLEDS +=1;
    }
    for(var i = (o.startLed-1)*3; i < (o.endLed)*3; i++){
        rgbBufferTemp[o.stripname][i] = rgbBuffer[o.stripname][i] ; //grab current strip values
    }

    num = parseFloat(numLEDS) + 1;
    middle = (num/2) ;
    counter = middle;
    middle = middle-1;
    walkArray = new Array(numLEDS*3).fill(0);
    percent = 1- (2/numLEDS);
    walkArray[middle*3] = red;
    walkArray[(middle*3)+1]= green;
    walkArray[(middle*3)+2] = blue;
    while(counter >0){
        counter = counter -1 ;
        walkArray[(middle+counter)*3] = red*Math.pow(percent,counter);//keep multiplying fade level
        walkArray[(middle+counter)*3+1]= green*Math.pow(percent,counter);
        walkArray[(middle+counter)*3+2] = blue*Math.pow(percent,counter);
        walkArray[(middle-counter)*3] = red*Math.pow(percent,counter);//keep multiplying fade level
        walkArray[(middle-counter)*3+1]= green*Math.pow(percent,counter);
        walkArray[(middle-counter)*3+2] = blue*Math.pow(percent,counter);
    }

    if(directionRight =='true') {
        count = (o.startLed - 1) * 3;
    }
    else{
        count =(o.endLed) * 3 -walkArray.length;
    }
    walkInterval = setInterval(function(){
        if(directionRight =='true') {
            count += 3;
            if (count > (((o.endLed) * 3) - walkArray.length)) {
                count = (o.startLed - 1) * 3;
            }
        }
        else{
            count -= 3;
            if (count < (o.startLed-1) * 3) {
                count = (o.endLed) * 3 -walkArray.length;
            }
        }

        for(var i = (o.startLed-1)*3; i < (o.endLed)*3; i++){
            rgbBuffer[o.stripname][i] = rgbBufferTemp[o.stripname][i] ; //update to orgional strip values
        }

        for(var i = 0; i < walkArray.length; i++){
            rgbBuffer[o.stripname][count+i] = walkArray[i];
        }
        updatestrip(o, rgbBuffer[o.stripname]); //bring back buffer to output
    },intervalMS);
}

function twoWayWalk(o,value){
    var newColor = parseColorToRGB(value.color);
    var counter = 0;
    red = newColor[0];
    green = newColor[1];
    blue = newColor[2];
    var middle = 0;

    clearInterval(walkInterval);
    intervalMS = parseFloat(value.intervalMS);
    var numLEDS = parseInt(value.numLEDs);


    if(numLEDS % 2 == 0){ //make suer num leds is an odd number so there is a middle value
        numLEDS +=1;
    }
    for(var i = (o.startLed-1)*3; i < (o.endLed)*3; i++){
        rgbBufferTemp[o.stripname][i] = rgbBuffer[o.stripname][i] ; //grab current strip values
    }

    num = parseFloat(numLEDS) + 1;
    middle = (num/2) ;
    counter = middle;
    middle = middle-1;
    walkArray = new Array(numLEDS*3).fill(0);
    percent = 1- (2/numLEDS);
    walkArray[middle*3] = red;
    walkArray[(middle*3)+1]= green;
    walkArray[(middle*3)+2] = blue;
    while(counter >0){
        counter = counter -1 ;
        walkArray[(middle+counter)*3] = red*Math.pow(percent,counter);//keep multiplying fade level
        walkArray[(middle+counter)*3+1]= green*Math.pow(percent,counter);
        walkArray[(middle+counter)*3+2] = blue*Math.pow(percent,counter);
        walkArray[(middle-counter)*3] = red*Math.pow(percent,counter);//keep multiplying fade level
        walkArray[(middle-counter)*3+1]= green*Math.pow(percent,counter);
        walkArray[(middle-counter)*3+2] = blue*Math.pow(percent,counter);
    }

    countup = (o.startLed - 1) * 3;
    countdn =(o.endLed) * 3 -walkArray.length;

    walkInterval = setInterval(function(){
        for(var i = (o.startLed-1)*3; i < (o.endLed)*3; i++){
            rgbBuffer[o.stripname][i] = rgbBufferTemp[o.stripname][i] ; //update to orgional strip values
        }

        countup += 3;
        if (countup > (((o.endLed) * 3) - walkArray.length)) { // at end so reset countup and countdn
            countup = (o.startLed - 1) * 3;
            countdn = (o.endLed) * 3 -walkArray.length;
        }

        for(var i = 0; i < walkArray.length; i++){
            rgbBuffer[o.stripname][countup+i] = walkArray[i];
        }

        countdn -= 3;

        for(var i = 0; i < walkArray.length; i++){
            rgbBuffer[o.stripname][countdn+i] = walkArray[i];
        }

        updatestrip(o, rgbBuffer[o.stripname]); //bring back buffer to output
    },intervalMS);
}

function rainbow(o,value){
    var numEachColor = value.numEachColor;
    for(var i = o.startLed-1; i < o.endLed*3; i+=7*3*numEachColor) {//operate on the

        for (var j = 0; j < numEachColor; j++) {
            if( (i + 20 +(j*3))>o.endLed *3){
                break;

            }
            rgbBuffer[o.stripname][i + 0 +(j*3)] = 0xFF;//red
            rgbBuffer[o.stripname][i + 1 +(j*3)] = 0x00;//red
            rgbBuffer[o.stripname][i + 2 +(j*3)] = 0x00;//red

            rgbBuffer[o.stripname][i + 3 +(j*3)] = 0xFF;//red
            rgbBuffer[o.stripname][i + 4 +(j*3)] = 0x7F;//red
            rgbBuffer[o.stripname][i + 5 +(j*3)] = 0x00;//red

            rgbBuffer[o.stripname][i + 6 +(j*3)] = 0xFF;//red
            rgbBuffer[o.stripname][i + 7 +(j*3)] = 0xFF;//red
            rgbBuffer[o.stripname][i + 8 +(j*3)] = 0x00;//red

            rgbBuffer[o.stripname][i + 9 +(j*3)] = 0x00;//red
            rgbBuffer[o.stripname][i + 10 +(j*3)] = 0xFF;//red
            rgbBuffer[o.stripname][i + 11 +(j*3)] = 0x00;//red

            rgbBuffer[o.stripname][i + 12 +(j*3)] = 0x00;//red
            rgbBuffer[o.stripname][i + 13 +(j*3)] = 0x00;//red
            rgbBuffer[o.stripname][i + 14 +(j*3)] = 0xFF;//red

            rgbBuffer[o.stripname][i + 15 +(j*3)] = 0x4b;//red
            rgbBuffer[o.stripname][i + 16 +(j*3)] = 0x00;//red
            rgbBuffer[o.stripname][i + 17 +(j*3)] = 0x82;//red

            rgbBuffer[o.stripname][i + 18 +(j*3)] = 0x94;//red
            rgbBuffer[o.stripname][i + 19 +(j*3)] = 0x00;//red
            rgbBuffer[o.stripname][i + 20 +(j*3)] = 0xd3;//red
        }
    }
    updatestrip(o, rgbBuffer[o.stripname]);
}

function parseColorToRGB(color){
    var val = new Array(3);
    var red = (color >>16) & 0xFF;
    var green = (color >>8) & 0xFF;
    var blue = color & 0xFF;
    val[0] = red;
    val[1] = green;
    val[2] = blue;
    return val;
}

function writeSPI(){ //sends entire buffer to led strip
    spi.write(buffer,function(e){
        if(e) console.log(e);
    });
}

exports.inwebsocket = function(data){
    switch (data.instruction){
        case "runcommand":
            rgb.incommand({command:data.command.name,value:data.value,obj:data.obj});
            break;

        default:
            console.log('Unknown Instruction:'+data.instruction);


    }

}

function convertTo32Array(rgbArray){
    var integer32 = new Uint32Array(rgbArray.length/3);
    var j = 0;
    for(var i = 0; i < rgbArray.length; i += 3){
        integer32[j] = (rgbArray[i] << 16) +  (rgbArray[i+1] << 8) + (rgbArray[i+2]);
        j+=1;
    }
    return integer32;

}


function updatestrip (o, bufferdata){

    colorbuffer[o.stripname]= convertTo32Array(bufferdata); //put thee rgb data back in the colorbuffer
    var sendobj = JSON.stringify({object:"buffer",data:{buffer: colorbuffer[o.stripname],stripname:o.stripname,leds:colorbuffer[o.stripname].length}});
    websock.send(sendobj,'lightstrip');
    if(os.type() != "Windows_NT") {

        ws281x.render(colorbuffer[o.stripname]);
    }
}
