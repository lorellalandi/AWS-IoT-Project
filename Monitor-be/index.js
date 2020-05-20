var express = require('express');
const app = express();
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({ region: 'us-east-1' });

// Create DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});

// Endpoint which returns the last hour values of all stations
app.get('/api/lastHour', function (req, res) {
    getLastHour().then(
        function (response) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.send(response);
        })
        .catch(function (err) {
            console.log(err)
            res.send('Error');
        });
});

// Endpoint which returns the latest values for a given station "id" (query param)
app.get('/api/station', function (req, res) {
    getLatestValues('Station', 'StationId', req.query.id).then(
        function (response) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.send(response);
        })
        .catch(function (err) {
            console.log(err)
            res.send('Error');
        });
});

getLastHour = function () {
    return new Promise(function (resolve, reject) {
        ddb.scan(lastHour(), function (err, data) {
            console.log("Quering");
            if (err) {
                console.log("Error", err);
                reject(new Error("Error rows is undefined"));
            } else {
                console.log("Success", data.Items);
                data.Items.forEach(function (element, index, array) {
                    console.log(JSON.stringify(element));
                });
                resolve(data.Items);
            }
        });
    })
}

// Returns all the values received during the last hour from all the station
var lastHour = function () {
    var date = new Date()
    date.setHours(date.getHours() - 1)
    var time = date.getTime() + '';

    return {
        TableName: "Station",
        FilterExpression: "StationTimestamp > :val",
        ExpressionAttributeValues: { ":val": { "S": time } }
    }
};


// Endpoint which returns the latest values for a given "activityRecognition" type (query param)
app.get('/api/latestActivity', function (req, res) {
    getLatestValues('UserActivity', 'activityRecognition', req.query.activityRecognition).then(
        function (response) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.send(response);
        })
        .catch(function (err) {
            console.log(err)
            res.send('Error');
        });
});

getLatestValues = function (tableName, partitionKeyName, partitionKeyValue) {
    return new Promise(function (resolve, reject) {
        ddb.query(latestValues(tableName, partitionKeyName, partitionKeyValue), function (err, data) {
            console.log("Quering");
            if (err) {
                console.log("Error", err);
                reject(new Error("Error rows is undefined"));
            } else {
                console.log("Success", data.Items);
                data.Items.forEach(function (element, index, array) {
                    console.log(JSON.stringify(element));
                });
                resolve(data.Items);
            }
        })
    })
}

// Returns the latest values
var latestValues = function (tableName, partitionKeyName, partitionKeyValue) {
    return {
        TableName: tableName,
        KeyConditions: {
            [partitionKeyName]:{
                ComparisonOperator:"EQ",
                AttributeValueList: [ { "S": partitionKeyValue } ]
            }
        },
        Limit: 1,
        ScanIndexForward: false
    }
}


// Endpoint which returns the latest values for a given table "tableName" (query param)
app.get('/api/lastHourActivities', function (req, res) {
    getLastHourByActivityRecognition('UserActivity', req.query.activityRecognition).then(
        function (response) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.send(response);
        })
        .catch(function (err) {
            console.log(err)
            res.send('Error');
        });
});

getLastHourByActivityRecognition = function (tableName, activityRecognition) {
    return new Promise(function (resolve, reject) {
        ddb.query(lastHourByActivityRecognition(tableName, activityRecognition), function (err, data) {
            console.log("Quering");
            if (err) {
                console.log("Error", err);
                reject(new Error("Error rows is undefined"));
            } else {
                console.log("Success", data.Items);
                data.Items.forEach(function (element, index, array) {
                    console.log(JSON.stringify(element));
                });
                resolve(data.Items);
            }
        })
    })
}

// Returns all the values received during the last hour
var lastHourByActivityRecognition = function (tableName, activityRecognition) {
    var date = new Date()
    date.setHours(date.getHours() - 1)
    var time = date.getTime() + '';

    return {
        TableName: tableName,
        KeyConditions: {
            "activityRecognition":{
                ComparisonOperator:"EQ",
                AttributeValueList: [ { "S": activityRecognition } ]
            },
            "activityTimestamp":{
                ComparisonOperator:"GT",
                AttributeValueList: [ { "S": time } ]
            }
        }
    }
};