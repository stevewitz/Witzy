/**
 * Created by todd on 12/12/2016.
 */
var sensors = require('ds1820-temp');

// promise based
sensors.listDevices().then(
    function (devices) {
        console.log('Read all devices', devices);
    },
    function (err) {
        console.log('An error occurred', err);
    }
);

// callback based
sensors.readDevices(function (err, devices) {
    if (err) {
        console.log('An error occurred', err);
        return;
    }

    console.log('Read all devices', devices);
});
