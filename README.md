

```
                                                                            
,---.|                  |   ,---.                          o               
|    |    ,---..   .,---|   `---..   .,---.,---.,---..    ,.,---.,---.,---.
|    |    |   ||   ||   |---    ||   ||   ||---'|     \  / |`---.|   ||    
`---'`---'`---'`---'`---'   `---'`---'|---'`---'`      `'  ``---'`---'`    
                                      |
```
# Cloud-Supervisor
Using Dome9's Compliance Engine for continuous compliance and enforcement of AWS environments.

## General
This project is a starting point that demonstrates how to utilize the Dome9 Compliance Engine as a mean to perform scheduled assessments for cloud environemets and then to have some automated actions to remediate.
It is a node.js project that can be launched from any machine, but intended to be run automatically via AWS Lambda execution environment.

The idea is to have this script running for each AWS account we wish to apply continous governance, where all scripts utilize the same centrally manged rule set (bundle).

## Getting started - setup
* Make sure to have node.js *version 4.0* or up.
* Clone this repo.
```
git clone https://github.com/Dome9/cloud-supervisor.git
```
* Install dependencies:
```
cd cloud-supervisor
npm install
```
* Make sure your AWS user / role has enough permissions to execute the desired actions (createTag, stopInstance)
* If running from Lambda, make sure that the Lambda role has sufficient permissions
* If running locally - make sure your AWS user has enough permissions, and that credentials are provided . AWS SDK for node.js expects credentials file to be located at ~/.aws/credentials (C:\Users\USER_NAME\.aws\credentials for Windows users) See http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html for more info.
* Make sure you have a valid Dome9 user with enough permissions to view the relevant AWS accounts. It is recommended to create a new, dedicated Dome9 user with 'Auditor' role. 
* Create a Dome9 V2 API key for the selected Dome9 user at : https://secure.dome9.com/v2/settings/credentials
* Set mandatory environment valriables:
    * keyId: Dome9 V2 API key ID
    * keySecret: Dome9 V2 API key secret
    * bundleId: the Dome9 Bundle Id of the relevant rule-set (see next section)
    * awsAccId: The Dome9 Id of the relevant AWS account. Note: this is not the AWS acc number. We'll soon support providing this parameter instead.

OSX, Linux:
```bash
export keyId=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
... handle the remaining parameters ...
```
Windows:
```
set keyId=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
... handle the remaining parameters ...
```
TODO - lambda installation / setup instructions


## Configuring the Dome9 Compliance Bundle
* Create a new bundle that will be used for automated compliance / governance. Note its ID (at the url bar) - you'll use it as the bundleId env parameter.
* Create rules at will. Use our rule-builder and the CSPL reference document (Make sure you've got it!)
* in the `Remediation` field of the rule add as the first line:
```
*AUTO* <name of action> <param1> <param n>...
```
Examples:
```
*AUTO* stop_instance
```
```
*AUTO* create_tag MyTag 12345
```

### Supported automatic actions
* `stop_instance` : will stop the relevant instance
* `create_tag` <tag_key> <tag_value> : will insert the tag with the desired key/value [make sure there are relevant permissions to stop instances]
* `mark_for_stop` <days> : will add the tag 'TO_STOP' with the value X days in the future (as unix time stamp) [make sure there are relevant `ec2:CreateTags` permissions]
* `send_sns` <topic_ARN> : will send a message with the failed test/entity details to the relevant SNS Topic. [make sure there are relevant `sns:Publish` permissions to this SNS topic]

We'll add many more soon.<br/>
Meanwhile, explore `actions.js` and see how easy it is to add a new action.

## Running the script (from local station)
Make sure all env variables are set.
Now, run the script:
```
node c-supervisor.js
```

## Deploying the script to AWS Lambda
In the `scripts` folder you'll find the `package-lambda.sh` script. It'll create a package ready to be deployed to lambda.
When creating the lamba function use these settings:
* Runtime: Node.JS 4.3
* Handler: lambda.myHandler
* Role: create a new role for the `cloud-supervisor`. Provide the role with enough permission do perform your actions.
* Timeout: Depending on your environemnt size, the bundle size (# of rules) and configured actions. The Dome9 system will take a few seconds to perfrom an assessment, and then the script will take additional time to automatically remediate. Set to at least 30 seconds, and monitor the execution time.
* VPC : no need to be run inside VPC unless your custom actions needs to have network connections to your VPC instances/data.
* Environment Variables: *Make sure* to include the requested environment variables:
    * keyId
    * keySecret 
    * awsAccId
    * bundleId

## AWS IAM permissions
AS the script will perform AWS API actions it'll need to have permissions to do so. If running locally make sure that the relevant user profile have enough permissions.
If running from EC2 Insytance - make sure that the instance's role have this policy.
If running from AWS Lambda, make sure the role have the default Lambda policy plus the relevant one.
For the built-in functions this is the required AWS IAM policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "allowSNS",
            "Action": [
                "sns:Publish"
            ],
            "Effect": "Allow",
            "Resource": "REPLACE HERE WITH THE ARN OF YOUR SNS TOPIC"
        },
        {
            "Sid": "allowTags",
            "Action": [
                "ec2:CreateTags"
            ],
            "Effect": "Allow",
            "Resource": "*"
        },
        {
            "Sid": "allowStopInstance",
            "Action": [
                "ec2:StopInstances"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
```


## Running the script from Lambda
- First trigger some manual invocations of the Lambda untill satisfied.
- Then, schedule it to run in an interval of hour / day (but not less than an hour)




