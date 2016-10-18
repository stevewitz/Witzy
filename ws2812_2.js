/**
 * Created by Steve on 10/15/2016.
 */
var ws281x = require('rpi-ws281x-native/lib/ws281x-native');

var NUM_LEDS = parseInt(process.argv[2], 20) || 20,
    pixelData = new Array(3*NUM_LEDS);

ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
    ws281x.reset();
    process.nextTick(function () { process.exit(0); });
});

for(var i = 0; i < 3* NUM_LEDS; i+=3) {
    pixelData[i] = 0xff;
    pixelData[i+1] = 0xff
    pixelData[i+2] = 0xff
}
ws281x.render(pixelData);

// ---- animation-loop
var t0 = Date.now();
setInterval(function () {
    var dt = Date.now() - t0;

    ws281x.setBrightness(
        Math.floor(Math.sin(dt/1000) * 128 + 128));
}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');