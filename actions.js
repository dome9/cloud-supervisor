/*
Automated actions examples.
This shows how easy it is to add autmated actions.
The system will invoke your action with the 1st parameter is the entity that failed the test,
and the rest of the parameters are the parameter that were provided in the rule.Remediation field
In this example (createTag) the rule's Remediation field looks something like:
*AUTO* create_tag PROBLEM non_complying_region

For simplicity it is assumed that the the script is run by an AWS user / role in the same AWS account as the non complying entities. 
This will be the example where we'll have a Lambda on each AWS account.
However, these actions could be more complex and assume into roles on other accounts. 
*/

const AWS = require('aws-sdk');

function createTag(entity,key,value) {
    if (!entity)
        throw "no entity was provided to tagInstance action";

    var region = entity.region.replace(/_/g, "-");
    var ec2 = new AWS.EC2({ region: region });

    var params = {
        Resources: [
            entity.id
        ],
        Tags: [
            {
                Key: key || "CLOUD-SUPERVISOR" , // default key if not provided
                Value: value || new Date().toUTCString() // default value if not provided
            }
        ]
    };
    ec2.createTags(params, function (err, data) {
        if (err)
            console.error(err, err.stack); // an error occurred
        //else console.log(data);           // successful response
    });
}
exports.create_tag = createTag;


function stopInstance(entity) {
    if (!entity)
        throw "no entity was provided to stopInstance action";

    var region = entity.region.replace(/_/g, "-");
    var ec2 = new AWS.EC2({ region: region });

    var params = {
        InstanceIds: [ 
            entity.id
        ],
        Force: false
    };
    
    ec2.stopInstances(params, function (err, data) {
        if (err)
            console.error(err, err.stack); // an error occurred
        //else console.log(data);           // successful response
    });
}
exports.stop_instance = stopInstance;