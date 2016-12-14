const supervisor = require('./c-supervisor');

function myHandler(event, context, callback) {
    
    try {
        // Mandatory parameters. Should be provided as env variables.
        var keyId = process.env.keyId; // Dome9 V2 API key ID
        var keySecret = process.env.keySecret; // Dome9 V2 API key secret
        var bundleId = process.env.bundleId; // the Dome9 Bundle Id of the relevant rule-set
        var awsAccId = process.env.awsAccId; // The Dome9 Id of the relevant AWS account. TODO: allow to provide the AWS acc number instead of the Dome9 ID
        console.log(`Executing cloud-supervisor from Lambda. bundleId=${bundleId}, awsAccId=${awsAccId}`);
        supervisor.performAssessment(keyId, keySecret, bundleId, awsAccId);
    }
    catch (err) {
        callback(err);
    }

}
exports.myHandler = myHandler;

