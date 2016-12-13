const _ = require('lodash');
const D9 = require('./d9-wrapper');
const actions = require('./actions');

// Mandatory parameters. Should be provided as env variables.
var params = {
    keyId: process.env.keyId, // Dome9 V2 API key ID
    keySecret: process.env.keySecret, // Dome9 V2 API key secret
    bundleId: process.env.bundleId, // the Dome9 Bundle Id of the relevant rule-set
    awsAccId: process.env.awsAccId // The Dome9 Id of the relevant AWS account. TODO: allow to provide the AWS acc number instead of the Dome9 ID
}

// Assert on mandatory parameters
_.forIn(params, (value, key) => {
    if (!value) {
        console.error(`${key} was not provided as an environment variable. Exiting...`);
        process.exit(1);
    }
});

// Perform the assessment using the Dome9 Compliance Engine
var req = D9.AssessmentRequest(params.bundleId, params.awsAccId);
var res = D9.performAssessment(params.keyId, params.keySecret, req, console.error, handleResult);
// ********************************************************


// Process the assessment result and invoke automated remediation actions
function handleResult(res) {
    //console.log(JSON.stringify(res));
    if (res.assessmentPassed) {
        console.log("Assessment successfully passed :) Nothing to do.");
        process.exit(0);
    }

    var failedTests = res.tests.filter((elm) => elm.nonComplyingCount);
    console.log(`${failedTests.length} failed tests`);

    var autoRemediationTests = failedTests.filter((elm) => elm.rule.remediation.indexOf('*AUTO*') === 0);
    console.log(`${autoRemediationTests.length} failed tests with auto remediation`);

    autoRemediationTests.forEach((elm) => {
        var actionAndParams = elm.rule.remediation.split('\n')[0].split(' ');
        var action = actionAndParams[1];
        var params = actionAndParams.slice(2);
        console.log('\n*********************************************************************')
        console.log(`* rule violation: ${elm.rule.name}`);
        console.log(`* configured auto action: "${action}"`);
        var actionFunc = actions[action];
        if (!actionFunc)
            console.log("Could not find built-in action: " + action);

        var failedEntities = _(elm.entityResults)
            .filter((item) => !item.isValid)
            .map('testObj')
            .value();

        failedEntities.forEach((entity) => {
            if (actionFunc) {
                try {
                    console.log(`executing action '${action}' for ${entity.type}: id=${entity.id}, name=${entity.name} region=${entity.region}`);
                    actionFunc.apply(undefined, [elm.rule,entity].concat(params));
                }
                catch (err) {
                    console.error(`error occured during execution of action ${action}: ${err}`);
                }
            }
        })
    });
}

