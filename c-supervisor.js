const _ = require('lodash');
const D9 = require('./d9-wrapper');
const actions = require('./actions');


function performAssessment(keyId, keySecret,bundleId, awsAccId) {
    // Assert on mandatory parameters
    if(! keyId)
        throw("keyId is a mandatory parameter");
    if(! keySecret)
        throw("keySecret is a mandatory parameter");
    if(! bundleId)
        throw("bundleId is a mandatory parameter");
    if(! awsAccId)
        throw("awsAccId is a mandatory parameter");                

    // Perform the assessment using the Dome9 Compliance Engine
    var req = D9.AssessmentRequest(bundleId, awsAccId);
    var res = D9.performAssessment(keyId, keySecret, req, handleError, handleResult);

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
                        actionFunc.apply(undefined, [elm.rule, entity].concat(params));
                    }
                    catch (err) {
                        console.error(`error occured during execution of action ${action}: ${err}`);
                    }
                }
            })
        });
    }

    function handleError(err){
        console.error(err);
        throw err;
    }
}
exports.performAssessment = performAssessment;

// Are we running it directly or loaded as library
if (require.main === module) {
    // running directly as a nodejs main module.
    console.log("Running cloud-supervisor as a console app (non library)");
    
    // Mandatory parameters. Should be provided as env variables.
    var keyId = process.env.keyId; // Dome9 V2 API key ID
    var keySecret = process.env.keySecret; // Dome9 V2 API key secret
    var bundleId = process.env.bundleId; // the Dome9 Bundle Id of the relevant rule-set
    var awsAccId = process.env.awsAccId; // The Dome9 Id of the relevant AWS account. TODO: allow to provide the AWS acc number instead of the Dome9 ID
    
    performAssessment(keyId,keySecret,bundleId,awsAccId);
}




