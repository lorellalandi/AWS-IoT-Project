var awsIot = require('aws-iot-device-sdk');

// NOTE: client identifiers must be unique within your AWS account; if a client attempts 
// to connect with a client identifier which is already in use, the existing 
// connection will be terminated.

var device = awsIot.device({
    keyPath: './certs/fc278d0e63-private.pem.key',          // private key path
    certPath: './certs/fc278d0e63-certificate.pem.crt',     // certificate path
    caPath: './certs/rootCA.pem',                           // rootCA certificate path
    clientId: 'VSENSOR',                                    // thing name
    host: 'a6as4ru7uhh5u-ats.iot.us-east-1.amazonaws.com'   // custom endpoint
});

//
// Device is an instance returned by mqtt.Client(), see mqtt.js for full
// documentation.
//
device
    .on('connect', function () {
        console.log('connect');
        device.subscribe('sensor/values');
    });

let counter = 1;
const idInterval = setInterval(() => {
    console.log(" [x] Sent %s from station 1", counter);
    device.publish('sensor/values', fetchData(1))
    console.log(" [x] Sent %s from station 2", counter);
    device.publish('sensor/values', fetchData(2))
    counter++
}, 3000);

//
//temperature (-50 ... 50 Celsius)
// humidity (0 ... 100%)
// wind direction (0 ... 360 degrees)
// wind intensity (0 ... 100 m/s)
// rain height (0 ... 50 mm / h)
//

var fetchData = function (stationId) {
    var temp = getRandomValue(-50, 51) + '';
    var humd = getRandomValue(0, 101) + '';
    var windDir = getRandomValue(0, 361) + '';
    var windInt = getRandomValue(0, 101) + '';
    var rainHeig = getRandomValue(0, 51) + '';
    var timestamp = new Date().getTime() + '';

    return JSON.stringify({
        "id": stationId,
        "timestamp": timestamp,
        "temperature": temp,
        "humidity": humd,
        "windDirection": windDir,
        "windIntensity": windInt,
        "rainHeight": rainHeig
    });
}

function getRandomValue(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}