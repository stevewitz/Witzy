/**
 * Created by todd on 12/12/2016.
 */
var fs = require('fs'),
    readdir = fs.readdir,
    readFile = fs.readFile,
    Promise = require('promise'),
    BASE_DIR = '/sys/bus/w1/devices/';
    var prev = {};
var thisthing = {};


listDevices(function(err,devices){
devices.forEach(function(sensorid){
    thisthing = {
        type:"temperature",
       id: witzyname+'-temperature-'+sensorid,
        name: 'Temperature - '+sensorid,
        ipaddress:localaddress+':'+settings.options.webserver.listenport,
        parent:witzyname,
        parenttype:'witzy',
        events:[
            {name:'temperature',values:'STRING',
                description:'Temp in F updated every min if change'}
        ]


    }
    console.log('Found 1-wire sensor:'+sensorid)
    ll.writething(thisthing,true);



});

})

setInterval(function(){readDevices(function (err, devices) {
    if (err) {
        console.log('An error occurred', err);
        return;
    }
    //console.log('Read all devices', devices);

    devices.forEach(function (x){
//       console.log('here'+JSON.stringify(x))
        if (prev[x.name] && prev[x.name] != x.value){
            console.log('temp '+x.name+' changed:'+x.value);
            server.send({
                event: {
                    id: witzyname+'-temperature-'+x.name,
                    event: 'temperature',
                    value: x.value,
                    eventdata: {},
                    source: ''
                }
            })
            console.log('send after')

        }

        prev[x.name] = x.value;
    })


})},2000);

function listDevices (cb) {
    return new Promise(function (fulfill, reject) {
        fs.readdir(BASE_DIR, function (err, list) {
            if (err) {
                reject(err);
                if (cb) {
                    cb(err);
                }
            } else {
                var result = parseDirectoryListing(list);
                fulfill(result);
                if (cb) {
                    cb(undefined, result);
                }
            }
        });
    });
}

function readDevices (cb) {
    return new Promise(function (fulfill, reject) {
        function handleError (err) {
            reject(err);
            if (cb) {
                cb(err);
            }
        }

        listDevices().then(function (items) {
            Promise.all(readFiles(items)).then(function (fileContents) {
                var result = fileContents.map(function (item) {
                    return parseFileContents(item);
                });

                fulfill(result);
                if (cb) {
                    cb(undefined, result);
                }
            }, handleError);
        }, handleError);
    });
}

function readDevice (deviceName, cb) {
    return new Promise(function (fulfill, reject) {
        var path = getDevicePath(deviceName);
        readFile(path, function (err, content) {
            var result;

            if (err) {
                reject(err);
                if (cb) {
                    cb(err, undefined);
                }
            } else {
                result = parseFileContents({'name': deviceName, 'data': content});
                fulfill(result);
                if (cb) {
                    cb(undefined, result);
                }
            }
        });
    });
}

function parseDirectoryListing (list) {
    return list.filter(function (item) {
        return item.lastIndexOf('28') === 0;
    }). map(function (item) {
        return item.substring(3);
    });
}

function readFiles (files) {
    var promises = files.map(function (file) {
        return new Promise(function (fulfill, reject) {
            var path = getDevicePath(file);;
            readFile(path, function (err, content) {
                if (err) {
                    reject(err);
                } else {
                    fulfill({'name': file, 'data': content.toString()});
                    //fulfill({ file: content.toString()});
                }
            });
        });
    });
    return promises;
}

function getDevicePath (deviceName) {
    return BASE_DIR + '28-' + deviceName + '/w1_slave';
}

function parseFileContents(item) {
    var strData = item.data.toString(),
        lines = strData.split("\n"),
        value;

    if (lines.length !== 3) throw new Error('Unexpected file format for ' + item.name, strData);

    crc(lines[0]);

    value = readTemperature(lines[1]);
    return {'name': item.name, 'value': value};
}

function crc (str) {
    var parts = str.split(' ');
    if (parts[parts.length - 1] !== 'YES')
        throw new Error('CRC failed');
}

function readTemperature(str) {
    var parts = str.split(' '),
        temperatureString = parts[parts.length - 1],
        temperatureParts = temperatureString.split('='),
        temperature = temperatureParts[1];
    return Number(((parseFloat(temperature)/1000)*1.8)+32).toFixed(3);
}

module.exports = {
    listDevices: listDevices,
    readDevices: readDevices,
    readDevice: readDevice
};