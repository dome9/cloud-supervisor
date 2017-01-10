const supervisor = require('./c-supervisor');
const AWS = require('aws-sdk');

function myHandler(event, context, callback) {
    // Mandatory parameters. Should be provided as env variables.
    var keyId = process.env.keyId; // Dome9 V2 API key ID
    var keySecret = process.env.keySecret; // Dome9 V2 API key secret
    var bundleId = process.env.bundleId; // the Dome9 Bundle Id of the relevant rule-set

    getAwsAccountNum( (err, awsAccId) => {
        if(err) callback(err);
        try {
            console.log(`Executing cloud-supervisor from Lambda. bundleId=${bundleId}, awsAccId=${awsAccId}`);
            supervisor.performAssessment(keyId, keySecret, bundleId, awsAccId);
        }
        catch (err) {
            callback(err);
        }
    });
}
exports.myHandler = myHandler;


// Will try to fetch from env variable: awsAccId .Will fallback to resolve from AWS STS API 
function getAwsAccountNum(cb) {
    if (process.env.awsAccId)
        cb(null, process.env.awsAccId);
    else {
        console.log("AWS Account number was not provided in env variables (awsAccId) - will dynamically resolve from STS");
        var sts = new AWS.STS();
        sts.getCallerIdentity({}, function (err, data) {
            if (err) cb(err);
            else cb(null, data.Account);
        });
    }
}

myHandler(null, null,console.log);