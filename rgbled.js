var debug = 1;
var console = {};
var os = require('os');
var colorbuffer = {};
var rgbBuffer = {};
var rgbBufferTemp = {};
var walkInterval=0;
var intervalMS = 100;
var directionRight = 'true';
var numToShift = 1;


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
 /*
    CHECKBOX arg example:(JSON)
  autoplay:{type:'input type = checkbox checked="true" value="checkbox"'},


  */
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
                    device:'rgb',
                    api:api,
                    command:'stripSetColor',
                    arguments:{name:'JSON',
                        color:{type:'input type = color',defaultvalue:'#ff00ff'},}
                },
                {name:'colorFade',
                    sendto:"witzy",
                    device:'rgb',
                    command:'colorFade',
                    arguments:{name:'JSON',
                        endColor:{type:'input type = color',defaultvalue:'#ff00ff'},
                            //  endColor:0xff0000,
                              fadeTimeSeconds:10}
                },
                {name:'simpleFade',
                    sendto:"witzy",
                    device:'rgb',
                    api:api,
                    command:'simpleFade',
                    arguments:{name:'JSON',
                        fadeLevel:0.5,
                        fadeTimeSeconds:10}
                },
                {name:'Blackout',
                    sendto:"witzy",
                    device:'rgb',
                    api:api,
                    command:'Blackout'

                },
                {name:'AllOn',
                    sendto:"witzy",
                    device:'rgb',
                    api:api,
                    command:'AllOn',
                    arguments:{name:'NUMBER'}
                },
                {name:'bubbleWalk',
                    sendto:"witzy",
                    device:'rgb',
                    api:api,
                    command:'bubbleWalk',
                    arguments:{
                        name:'JSON',
                        numLEDs:5,
                        directionRight:'true',
                        intervalMS:100,
                        color:{type:'input type = color',defaultvalue:'#ff00ff'}
                            }
                },
                {name:'twoWayWalk',
                    sendto:"witzy",
                    device:'rgb',
                    api:api,
                    command:'twoWayWalk',
                    arguments:{
                        name:'JSON',
                        numLEDs:5,
                        intervalMS:100,
                        color:{type:'input type = color',defaultvalue:'#ff00ff'}
                             }
                },
                {name:'rainbow',
                    sendto:"witzy",
                    device:'rgb',
                    api:api,
                    command:'rainbow',
                    arguments:{name:'JSON',
                        numEachColor:1}

                },
                {
                    name: 'oneLed',
                    sendto: "witzy",
                    device:'rgb',
                    api:api,
                    command: 'oneLed',
                    arguments: {
                        name: 'JSON',
                        ledNum: 1,
                        ledColor:{type:'input type = color',defaultvalue:'#ff00ff'},
                        repeatInterval: 5
                    }

                },
                {
                    name: 'shiftRight',
                    sendto: "witzy",
                    device:'rgb',
                    api:api,
                    command: 'shiftRight',
                    arguments: {
                        name: 'JSON',
                        numberToShift: 1,
                        intervalMS:100
                    }

                },
                {
                    name: 'shiftLeft',
                    sendto: "witzy",
                    device:'rgb',
                    api:api,
                    command: 'shiftLeft',
                    arguments: {
                        name: 'JSON',
                        numberToShift: 1,
                        intervalMS:100
                    }

                },
                {
                    name: 'colorGradient',
                    sendto: "witzy",
                    device:'rgb',
                    api:api,
                    command: 'colorGradient',
                    arguments: {
                        name: 'JSON',
                        startColor:{type:'input type = color',defaultvalue:'#ff00ff'},
                        endColor:{type:'input type = color',defaultvalue:'#ffff00'}
                    }

                },
                {
                    name: 'colorGradientMirror',
                    sendto: "witzy",
                    device:'rgb',
                    api:api,
                    command: 'colorGradientMirror',
                    arguments: {
                        name: 'JSON',
                        startColor:{type:'input type = color',defaultvalue:'#ff00ff'},
                        endColor:{type:'input type = color',defaultvalue:'#ffff00'}
                    }

                },
                {
                    name: 'warning',
                    sendto: "witzy",
                    device:'rgb',
                    api:api,
                    command: 'warning',
                    arguments: {
                        name: 'JSON',
                        intervalMS:200
                    }
                }

            ]
        }
        ll.writething(device,true)

}


    //});
exports.incommand = function(c){
    console.log(c.command)
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
        case "oneLed":
            oneLed(c.obj,c.value);
            break;
        case "shiftRight":
            shiftRight(c.obj,c.value);
            break;
        case "shiftLeft":
            shiftLeft(c.obj,c.value);
            break;
        case "colorGradient":
            colorGradient(c.obj,c.value);
            break;
        case "colorGradientMirror":
            colorGradientMirror(c.obj,c.value);
            break;
        case "warning":
            warning(c.obj,c.value);
            break;
    }
}

function stripSetColor (o,value){ // first led is led 1  //
    console.log(o.startLed+':'+o.endLed);
    //set rgbbuffer to color from value
    var startLED = o.startLed;
    var endLed = o.endLed;
    if(value.color){
        var newColor = parseColorToRGB(value.color)
    }
    else{
        var newColor = parseColorToRGB(value);
    }

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
    var numEachColor = parseInt(value.numEachColor);
    var rainbowArray = [0xFF, 0x00, 0x00, 0xFF, 0x7F, 0x00, 0xFF, 0xFF, 0x00,0x00, 0xFF, 0x00, 0x00, 0x00, 0xFF, 0x4b, 0x00, 0x82, 0x94, 0x00, 0xd3]; //rainbow colors
    var numToIncrement = (o.startLed-1) *3;
 mainLoop:   for(var i = (o.startLed-1) *3; i < o.endLed*3; i+=rainbowArray.length*numEachColor) {//operate on the
        if( (i + 20 +j)>o.endLed *3){
          //  break;
        }
        for (var j = 0; j < rainbowArray.length; j+=3) {
            var countloops = 0;
            while(countloops < numEachColor) {
                if(numToIncrement +3 > o.endLed*3) {
                    break mainLoop;
                }
                rgbBuffer[o.stripname][numToIncrement] = rainbowArray[j];
                rgbBuffer[o.stripname][numToIncrement +1] = rainbowArray[j+1];
                rgbBuffer[o.stripname][numToIncrement+2] = rainbowArray[j+2];
                countloops ++;
                numToIncrement +=3;

            }
        }
    }
    updatestrip(o, rgbBuffer[o.stripname]);
}

function oneLed(o,value){
    var colors = parseColorToRGB(value.ledColor);
    ledNum = parseInt(value.ledNum) -1;
    for(var i = ledNum*3; i < o.endLed*3 - 3; i+=parseInt(value.repeatInterval*3)) {
        rgbBuffer[o.stripname][i] = colors[0];
        rgbBuffer[o.stripname][i + 1] = colors[1];
        rgbBuffer[o.stripname][i + 2] = colors[2];
        if (parseInt(value.repeatInterval) == 0) {
            break;
        }
    }
    updatestrip(o, rgbBuffer[o.stripname]);
}

function shiftRight(o,value){
    numToShift = parseInt(value.numberToShift);
    intervalMS = value.intervalMS;
    walkInterval = setInterval(function(){
        var a = rgbBuffer[o.stripname].length;
       rgbBuffer[o.stripname] = arrayRotate(rgbBuffer[o.stripname],-numToShift*3);
        updatestrip(o, rgbBuffer[o.stripname]); //bring back buffer to output
    },intervalMS);
}

function shiftLeft(o,value){
    numToShift = parseInt(value.numberToShift);
    intervalMS = value.intervalMS;
    walkInterval = setInterval(function(){
        var a = rgbBuffer[o.stripname].length;
        rgbBuffer[o.stripname] = arrayRotate(rgbBuffer[o.stripname],+numToShift*3);
        updatestrip(o, rgbBuffer[o.stripname]); //bring back buffer to output
    },intervalMS);
}

function colorGradient(o,value) {
    var origColor = parseColorToRGB(value.startColor);
    var origred = origColor[0];
    var origgreen = origColor[1];
    var origblue = origColor[2];
    
    var newColor = parseColorToRGB(value.endColor);
    red = newColor[0];
    green = newColor[1];
    blue = newColor[2];
    
    var numberOfLedsInStrip = o.endLed - (o.startLed-1);
    var redDelta = (origred-red)/(numberOfLedsInStrip);
    var greenDelta = (origgreen-green)/(numberOfLedsInStrip);
    var blueDelta = (origblue-blue)/(numberOfLedsInStrip);
    rgbBuffer[o.stripname][o.startLed-1] = origred;
    rgbBuffer[o.stripname][o.startLed-1 +1] = origgreen;
    rgbBuffer[o.stripname][o.startLed-1 +2] = origblue;

    for(var i = (o.startLed-1)*3; i < (o.endLed-1)*3; i+=3){

        rgbBuffer[o.stripname][i+3]= rgbBuffer[o.stripname][i]-redDelta;
        rgbBuffer[o.stripname][i+1+3]= rgbBuffer[o.stripname][i+1]-greenDelta;
        rgbBuffer[o.stripname][i+2+3]= rgbBuffer[o.stripname][i+2]-blueDelta;
    }
    updatestrip(o, rgbBuffer[o.stripname]);
}
function colorGradientMirror(o,value) {
    var origColor = parseColorToRGB(value.startColor);
    var origred = origColor[0];
    var origgreen = origColor[1];
    var origblue = origColor[2];

    var newColor = parseColorToRGB(value.endColor);
    red = newColor[0];
    green = newColor[1];
    blue = newColor[2];

    var numberOfLedsInStrip = (o.endLed - (o.startLed-1))/2;
    var redDelta = (origred-red)/(numberOfLedsInStrip);
    var greenDelta = (origgreen-green)/(numberOfLedsInStrip);
    var blueDelta = (origblue-blue)/(numberOfLedsInStrip);
    rgbBuffer[o.stripname][o.startLed-1] = origred;
    rgbBuffer[o.stripname][o.startLed-1 +1] = origgreen;
    rgbBuffer[o.stripname][o.startLed-1 +2] = origblue;

    for(var i = (o.startLed-1)*3; i < ((o.endLed-1)*3)/2; i+=3){ //change the first half of the lights

        rgbBuffer[o.stripname][i+3]= rgbBuffer[o.stripname][i]-redDelta;
        rgbBuffer[o.stripname][i+1+3]= rgbBuffer[o.stripname][i+1]-greenDelta;
        rgbBuffer[o.stripname][i+2+3]= rgbBuffer[o.stripname][i+2]-blueDelta;
    }
    var cnt = 1;
    for( var i = parseInt(((o.endLed -1)*3)/2); i < (o.endLed-1)*3; i++){// change the second half
        rgbBuffer[o.stripname][i]= rgbBuffer[o.stripname][parseInt(((o.endLed-1)*3)/2)-cnt]

        console.log(i + "  "+    rgbBuffer[o.stripname][parseInt(((o.endLed-1)*3)/2)-cnt]+ "  "+ cnt);
        cnt ++;
    }
    updatestrip(o, rgbBuffer[o.stripname]);
}


function warning(o,value){
    var intervalMS = value.intervalMS;
    var startLED = o.startLed -1;
    var endLed = o.endLed;
    walkInterval = setInterval(function(){
        for(var i = startLED; i < endLed*3; i++){//set all leds to white
            rgbBuffer[o.stripname][i] = 0xFF;
        }
        updatestrip(o, rgbBuffer[o.stripname]);

        setTimeout(function(){
            for(var i = startLED; i < endLed*3; i++){//set all leds off
                rgbBuffer[o.stripname][i] = 0x00;
            }
            updatestrip(o, rgbBuffer[o.stripname]);

        },intervalMS);

        setTimeout(function(){
            for(var i = startLED; i < endLed*3; i+=3){//set all leds to red
                rgbBuffer[o.stripname][i] = 0xFF;
            }
            updatestrip(o, rgbBuffer[o.stripname]);

        },intervalMS*2);

        setTimeout(function(){
            for(var i = startLED; i < endLed*3; i++){//set all leds off
                rgbBuffer[o.stripname][i] = 0x00;
            }
            updatestrip(o, rgbBuffer[o.stripname]);

        },intervalMS*3);

    },intervalMS*4);

}

function arrayRotate(arr, count) {
    count -= arr.length * Math.floor(count / arr.length)
    arr.push.apply(arr, arr.splice(0, count))
    return arr
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
