/*
Automated actions examples.
This shows how easy it is to add autmated actions.
The system will invoke your action where the 1st parameter is the failed rule, the 2nd is the entity that failed the test,
and the rest of the parameters are the parameter that were provided in the rule.Remediation field
In this example (createTag) the rule's Remediation field looks something like:
*AUTO* create_tag PROBLEM non_complying_region

where the action is implemented as function myAction(rule,entity,tagKey,tagValue){...}

For simplicity it is assumed that the the script is run by an AWS user / role in the same AWS account as the non complying entities. 
This will be the example where we'll have a Lambda on each AWS account.
However, these actions could be more complex and assume into roles on other accounts. 
*/

const AWS = require('aws-sdk');

function createTag(rule, entity, key, value) {
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
                Key: key || "CLOUD-SUPERVISOR", // default key if not provided
                Value: value
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


function stopInstance(rule, entity) {
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


/*
This function marks the problematic entity with the tag "TO_STOP" and the desired stopping time which is a parameter (days in th future).
The compliance engine can be used also for the actual house keeping and stop the relevant instances after their time is due.
For this, use this logic:
Instance where isRunning should not have tags with [key='TO_STOP' and value before (0,'days')]

and the auto remediation action:
*AUTO* stop_instance
*/
function markForStop(rule, entity, numOfDays) {
    numOfDays = parseInt(numOfDays);
    if (!numOfDays)
        numOfDays = 3;// default value - stop in 3 days

    var stopTime = new Date();
    stopTime.setDate(stopTime.getDate() + numOfDays);
    stopTimeUnix = Math.floor(stopTime.getTime() / 1000); // convert to unix time (in seconds rather than millis in JS)
    createTag(entity, "TO_STOP", String(stopTimeUnix));
}
exports.mark_for_stop = markForStop;


/*
Send failed test entity result as SNS notification.
ARN is a mandatory parameter.

Usage in rule would be something like:
*AUTO* send_sns arn:aws:sns:us-west-1:1234567890:cloud-supervisor
*/
function sendSNS(rule, entity, ARN) {
    if(! ARN)
        throw "ARN is mandatory parameter for send_sns action";
    var region = ARN.split(":")[3].replace(/_/g, "-"); // extract it from the ARN and replace _ with -
    var sns = new AWS.SNS({region:region});
    
    var msg = {msg:"Entity failed compliance test", rule:rule, entity:entity};
    var params = {
        Message: JSON.stringify(msg),
        Subject : "Entity failed compliance test",
        MessageAttributes: {
            ruleName: {
                DataType: 'String',
                StringValue: rule.name ? rule.name : "-"
            },
            entityId: {
                DataType:'String',
                StringValue: entity.id ? entity.id : "-"
            },
            entityType: {
                DataType:'String',
                StringValue: entity.type ? entity.type : "-"
            },
            entityVPC: {
                DataType:'String',
                StringValue: entity.vpc && entity.vpc.id ? entity.vpc.id : "-"
            },
            entityRegion: {
                DataType:'String',
                StringValue: entity.region ? entity.region : "-"
            }
        },
        MessageStructure: 'String',
        TopicArn: ARN
    };
    
    sns.publish(params, function (err, data) {
        if (err) console.error(err, err.stack); // an error occurred
        //else console.log(data);           // successful response
    });
}
exports.send_sns = sendSNS;

/*
Helper for AWS results callback. Make our API logs a bit clearer
by showing which c-supervisor action triggered it
*/
function handleAWSResponse(func,err,data) {
    if (err) {
        console.log("ERROR: "+func+": AWS API: "+JSON.stringify(err,null,4));
    } else {
        console.log("OK: "+func+": AWS API: "+JSON.stringify(data,null,4));
    }
}

/*
debug_action action. Simply dumps the contents of both of the supplied arguments
and any optional arguments to the console log.
*/
function debugAction() {
    var numargs=arguments.length;
    if (numargs<2)
        console.log("ERROR: debugAction: <2 arguments passed ("+numargs+")");
    else {
    	console.log("DEBUG: debugAction: rule arg="+JSON.stringify(arguments[0],null,4));
    	console.log("DEBUG: debugAction: entity arg="+JSON.stringify(arguments[1],null,4));
	
 	   for (var i=2;i<arguments.length;i++)
    	    console.log("DEBUG: debugAction: opt arg "+i+"="+JSON.stringify(arguments[i],null,4));
    }
}
exports.debug_action=debugAction;


/*
set_user_group action. This function pulls the username out of the entity 
object and subscribes them to the group as indicated in the first parameter.
*/
function setUserGroup (rule,entity,groupname) {
    if (!entity)
        console.log("ERROR: setUserGroup: No entity provided to our action function");

    else if (!groupname)
        console.log("ERROR: setUserGroup: Group Name parameter not set");
    else if (!entity.hasOwnProperty('name')) 
        console.log("ERROR: setUserGroup: User name doesn't exist in entity (not IamUser rule?)");
    else if (entity.name == "")
        console.log("ERROR: setUserGroup: Can't deduce user name (not IamUser rule?)");
    else if (entity.name=="<root_account>")
        console.log("WARNING: setUserGroup: Can't set group membership for root user");
    else if (/^[a-zA-Z=,@~]+$/.test(groupname)) {
        var iam=new AWS.IAM();
        // console.log("DEBUG: setUserGroup: Calling AWS API to join "+entity.name+" to group "+groupname);
        var params={
            GroupName: groupname,
            UserName: entity.name
        };
        iam.addUserToGroup(params,function (err,data) {
            handleAWSResponse("setUserGroup",err,data);
        });
    } else 
        console.log("ERROR: setUserGroup: Invalid Group Name");
	

}
exports.set_user_group=setUserGroup;
