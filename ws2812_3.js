/**
 * Created by Steve on 10/15/2016.
 */
var ws281x = require('rpi-ws281x-native/lib/ws281x-native');

var NUM_LEDS = 10//parseInt(process.argv[2], 20) || 20,
    pixelData1 = new Array(3*NUM_LEDS);

ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
    ws281x.reset();
    process.nextTick(function () { process.exit(0); });
});

for(var i = 0; i < 3* NUM_LEDS; i+=3) {
    pixelData1[i] = 0xff;
    pixelData1[i+1] = 0x00
    pixelData1[i+2] = 0xff
}
pixelData = convertTo32Array(pixelData1);
ws281x.render(pixelData);

// ---- animation-loop
var t0 = Date.now();
setInterval(function () {
    var dt = Date.now() - t0;

    ws281x.setBrightness(
        Math.floor(Math.sin(dt/1000) * 128 + 128));
}, 1000 / 30);

function convertTo32Array(rgbArray){
    var integer32 = new Uint32Array(rgbArray.length/3);
    var j = 0;
    for(var i = 0; i < rgbArray.length; i += 3){
        var test = 0x0abbff;
        integer32[j] = (rgbArray[i] << 16) +  (rgbArray[i+1] << 8) + (rgbArray[i+2]);
        j+=1;
    }
    return integer32;

}

console.log('Press <ctrl>+C to exit.');