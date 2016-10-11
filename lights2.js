/**
 * Created by steve on 9/9/2016. A
 */
//open spi port
var SPI = require('pi-spi');
var numberLEDS = 50;
var buffer = new Buffer(4*numberLEDS);
var array = new Array(4*numberLEDS);
var spi = SPI.initialize("/dev/spidev0.0");
spi.clockSpeed(2e6); //2 mHZ
server = require('./rgbledserver.js');
server.start(receivedcommand,8201);

buffer[0] = 0;
buffer[1] = 0;
buffer[2] = 0;
buffer[3] = 0; // first for bytes of buffer are 0 for apa102

for(var i = 4; i < buffer.length; i+=4){
    buffer[i]=100; // this is brightness
    buffer[i+1]=255;
    buffer[i+2]=255;
    buffer[i+3]=255;
}

writeSPI();

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