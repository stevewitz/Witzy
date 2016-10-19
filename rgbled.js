var debug = 1;
var console = {};
var ws281x = require('rpi-ws281x-native/lib/ws281x-native');
console.log = (function () {return function (x) {if (debug) {process.stdout.write(ll.ansitime('red','rgb ') + x + '\n');}}})();


/**
 * Created by steve on 9/9/2016. A
 */
//open spi port
//var numberLEDS = 50; // set this global in app
var colorbuffer = {}

settings.hardware.rgbled.forEach(function(x,index){
    colorbuffer[x.name]  = new Uint32Array(x.leds);
    rgbBuffer[x.name] = [x.leds*3]; //declare 2 dimension array
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
                }
            ]
        }
        ll.writething(device,true)

}


    });
exports.incommand = function(c){
    //console.log(JSON.stringify(c,null,4))
    switch (c.command){
        case "stripSetColor":
            stripSetColor(c.obj,c.value)
            break;
        case "colorFade":
            colorFade(c.obj,c.value)
            break;

    }



}

//fadeSimple(20,25,.1,10);
//fadeColor(5,10,255,0,200,10);

function copyBuffer(){
    for(var i = 0; i< buffer.length; i++){
        array[i] = buffer[i];
    }
}

function updateBuffer(){
    for(var i = 0; i< buffer.length; i++){
        buffer[i] = array[i];
    }
}

function setBlackout(){ // all lights immediately off
    for(var i = 0; i < buffer.length; i+=3) {
        buffer[i] = 0;
        buffer[i + 1] = 0;
        buffer[i + 2] = 0;
    }
    writeSPI();
}

function setAllOn(){ //all lights immediately on white max bright
    for(var i = 0; i < buffer.length; i+=3) {
        buffer[i] = 255;
        buffer[i + 1] = 255;
        buffer[i + 2] = 255;
    }
    writeSPI();
}

function fadeSimple(startLED, endLed, fadeLevel, fadeTime){// fades up or down. Fade level is between 0 and 1 with 1 being all bright.  50% level is .5
    var count = 0;
    var intervalTime = parseInt((fadeTime *1000)/255);
    var stepSizeB = (buffer[((startLED-1)*3)]-  buffer[((startLED-1)*3)]*(fadeLevel))/255;
    var stepSizeG = (buffer[((startLED-1)*3) + 1]-  buffer[((startLED-1)*3) + 1]*(fadeLevel))/255;
    var stepSizeR = (buffer[((startLED-1)*3) + 2]-  buffer[((startLED-1)*3) + 2]*(fadeLevel))/255;
    copyBuffer(); // send data to non 8 bit array
    var simpleFadeInterval = setInterval(function(){
        count +=1;
        if(count >  255){
            clearInterval(simpleFadeInterval);
        }
        for(var i = (startLED-1)*3; i < (endLed)*3; i+=3){
            array[i] -= stepSizeB;
            array[i+1] -= stepSizeG;
            array[i+2] -= stepSizeR;
        }

        updateBuffer(); //bring back buffer to output
        writeSPI();
       // console.log(count +    " "+ buffer[15] +    " "+ buffer[16]+    " "+ buffer[17] + " " + array[15]);
    },intervalTime);
}


function fadeColor(startLED, endLed, red, green, blue, fadeTime){ // fades up or down automatically
    var count = 0;
    var intervalTime = parseInt((fadeTime *1000)/255);
    var stepSizeB = (buffer[((startLED-1)*3)]-  blue)/255;
    var stepSizeG = (buffer[((startLED-1)*3) + 1]-  green)/255;
    var stepSizeR = (buffer[((startLED-1)*3) + 2]-  red)/255;
    copyBuffer(); // send data to non 8 bit array
    var simpleFadeInterval = setInterval(function(){
        count +=1;
        if(count >  255){
            clearInterval(simpleFadeInterval);
        }
        for(var i = (startLED-1)*3; i < (endLed)*3; i+=3){
            array[i] -= stepSizeB;
            array[i+1] -= stepSizeG;
            array[i+2] -= stepSizeR;
        }
        updateBuffer(); //bring back buffer to output
        writeSPI();
    },intervalTime);
}

function colorFade(o,value){ // fades up or down automatically
    console.log('value:'+JSON.stringify(value,null,4))
    return
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
    var stepSizeB = (rgbBuffer[o.stripname][((startLED-1)*3)]-  red)/255;
    var stepSizeG = (rgbBuffer[o.stripname][((startLED-1)*3) + 1]-  green)/255;
    var stepSizeR = (rgbBuffer[o.stripname][((startLED-1)*3) + 2]-  blue)/255;

    var simpleFadeInterval = setInterval(function(){
        count +=1;
        if(count >  255){
            clearInterval(simpleFadeInterval);
        }
        for(var i = (startLED-1)*3; i < (endLed)*3; i+=3){
            rgbBuffer[o.stripname][i] -= stepSizeR;
            rgbBuffer[o.stripname][i+1] -= stepSizeG;
            rgbBuffer[o.stripname][i+2] -= stepSizeB;
        }
        updates(o, rgbBuffer[o.stripname]); //bring back buffer to output

    },intervalTime);
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

function stripSetColor (o,value){ // first led is led 1  //

    console.log(o.startLed+':'+o.endLed);
    if (typeof(value) == 'number'){
        for(var i = (o.startLed-1); i < (o.endLed); ++i){
            colorbuffer[o.stripname][i] = value;
        }

    }else
    {

        for(var i = (o.startLed-1); i < (o.endLed); ++i){
            colorbuffer[o.stripname][i] = value;
        }
    }
    updatestrip(o, rgbBuffer);

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
    ws281x.init(colorbuffer[o.stripname].length);
    ws281x.render(colorbuffer[o.stripname]);


}
