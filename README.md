

```
                                                                            
,---.|                  |   ,---.                          o               
|    |    ,---..   .,---|   `---..   .,---.,---.,---..    ,.,---.,---.,---.
|    |    |   ||   ||   |---    ||   ||   ||---'|     \  / |`---.|   ||    
`---'`---'`---'`---'`---'   `---'`---'|---'`---'`      `'  ``---'`---'`    
                                      |                                                                                                                            88                                                                                        
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
Currently these are the only provided automatic actions:
* `stop_instance`
* `create_tag`

We'll add many more soon.<br/>
Meanwhile explore `actions.js` and see how easy it is to add a new action.

## Running the script (from local station)
Make sure all env variables are set.
Now, run the script:
```
node c-supervisor.js
```

## Running the script from Lambda - TODO
We'll soon provide instructions and a Lambda entry point script.
This should work the same - just provide the env parameter to the Lambda via the new Lambda env variables capability.




