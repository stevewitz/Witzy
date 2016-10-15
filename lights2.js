/**
 * Created by steve on 9/9/2016. A
 */
//open spi port
var SPI = require('pi-spi');
//var numberLEDS = 50; // set this global in app
var buffer = new Buffer(4*numberLEDS);
var array = new Array(4*numberLEDS);
var spi = SPI.initialize("/dev/spidev0.0");
spi.clockSpeed(.5e6); //2 mHZ
server = require('./rgbledserver.js');
server.start(receivedcommand,8201);

buffer[0] = 0;
buffer[1] = 0;
buffer[2] = 0;
buffer[3] = 0; // first for bytes of buffer are 0 for apa102

for(var i = 4; i < buffer.length; i+=4){
    buffer[i]=255; // this is brightness
    buffer[i+1]=255;
    buffer[i+2]=255;
    buffer[i+3]=255;
}

writeSPI();

fadeSimple(5,10,.01, 10);

function receivedcommand(o){
    console.log("error here" + o);

    if (o.command == 'ledSetColor' ){
        ledSetColor (o.led,o.value);
        writeSPI();

    } else if (o.command == 'setlevel' ){
        console.log(o);
        console.log(o.obj)
        for (var i = o.obj.startled; i <= o.obj.endled; i++){

            ledSetColor (i,o.value);
        }

        writeSPI();


    }


    console.log(o);



}
function writeSPI(){ //sends entire buffer to led strip
    spi.write(buffer,function(e){
        if(e) console.log(e);
    });
}


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

function fadeSimple(startLED, endLed, fadeLevel, fadeTime){// fades up or down. Fade level is between 0 and 1 with 1 being all bright.  50% level is .5
    var count = 0;
    startLED +=4;
    endLed +=4;//offset from 32 start bits
    var intervalTime = parseInt((fadeTime *1000)/255);
    var stepSizeB = (buffer[((startLED-1)*4) + 1]-  buffer[((startLED-1)*4) + 1]*(fadeLevel))/255;
    var stepSizeG = (buffer[((startLED-1)*4) + 2]-  buffer[((startLED-1)*4) + 2]*(fadeLevel))/255;
    var stepSizeR = (buffer[((startLED-1)*4) + 3]-  buffer[((startLED-1)*4) + 3]*(fadeLevel))/255;
    copyBuffer(); // send data to non 8 bit array
    var simpleFadeInterval = setInterval(function(){
        count +=1;
        if(count >  255){
            clearInterval(simpleFadeInterval);
        }
        for(var i = (startLED-1)*4; i < (endLed)*4; i+=4){
            array[i + 1] -= stepSizeB;
            array[i + 2] -= stepSizeG;
            array[i + 3] -= stepSizeR;
        }

        updateBuffer(); //bring back buffer to output
        writeSPI();
        // console.log(count +    " "+ buffer[15] +    " "+ buffer[16]+    " "+ buffer[17] + " " + array[15]);
    },intervalTime);
}