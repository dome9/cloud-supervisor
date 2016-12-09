# Temp Documentation of Assessment / Rules Management API
This will be removed from this repo and be integrated into Dome9 V2 API docs located at: https://github.com/Dome9/V2_API

## Performing Assessments
Note: it is best to review the code in `d9-wrapper` to review how to create a request and then `c-supervisor` to review how to process the result. 
#### Endpoint:
https://api.dome9.com/v2/assessment/bundle

#### Method
POST

#### Request parameters:
* cloudAccountId: the Dome9 ID of the AWS account. It can be fetched from the UI or from enumerating the AWS accounts in V2 api (https://github.com/Dome9/V2_API/blob/master/README.md#aws-accounts). Note: we'll soon allow to provide the AWS account Id instead of the Dome9 ID
* id: The bundle Id as defined in the Dome9 system.
* region: Provide empty string to cover all regions in the account. If specified it'll perfrom an assessment only for the specified region.
* isTemplate : identifies if it is a builtin managed policy rather than a custom (user created one). Default value is false which means a user created bundle. Note: this parameter will son be removed and will be deducted automatically.

#### Response:
The result is of type `AssessmentResultViewModel`
```
AssessmentResultViewModel {
    request (AssessmentRequestViewModel, optional): Request ,
    tests (Array[RuleEngineTestResultViewModel], optional): Tests ,
    locationMetadata (LocationMetadata, optional): Location metadata ,
    assessmentPassed (boolean, optional, read only): AssessmentPassed ,
    hasErrors (boolean, optional, read only): HasErrors
}
AssessmentRequestViewModel {
    cloudAccountId (string, optional),
    externalAcountId (string, optional),
    region (string, optional),
    cloudNetwork (string, optional),
    cloudAccountType (string, optional) = ['Aws', 'Azure']
}
RuleEngineTestResultViewModel {
    error (string, optional),
    testedCount (integer, optional),
    relevantCount (integer, optional),
    nonComplyingCount (integer, optional),
    entityResults (Array[ValidationResult], optional),
    rule (object, optional),
    testPassed (boolean, optional, read only)
}
LocationMetadata {
    account (LocationConventionMetadataViewModel, optional),
    region (LocationConventionMetadataViewModel, optional),
    cloudNetwork (LocationConventionMetadataViewModel, optional)
}
ValidationResult {
    isRelevant (boolean, optional),
    isValid (boolean, optional),
    error (string, optional),
    testObj (object, optional)
}
LocationConventionMetadataViewModel {
    srl (string, optional),
    name (string, optional),
    id (string, optional),
    externalId (string, optional)
}
```

an example of response would be:
```json
{
  "request": {
    "cloudAccountId": "string",
    "externalAcountId": "string",
    "region": "string",
    "cloudNetwork": "string",
    "cloudAccountType": "Aws"
  },
  "tests": [
    {
      "error": "string",
      "testedCount": 0,
      "relevantCount": 0,
      "nonComplyingCount": 0,
      "entityResults": [
        {
          "isRelevant": true,
          "isValid": true,
          "error": "string",
          "testObj": {}
        }
      ],
      "rule": {},
      "testPassed": true
    }
  ],
  "locationMetadata": {
    "account": {
      "srl": "string",
      "name": "string",
      "id": "string",
      "externalId": "string"
    },
    "region": {
      "srl": "string",
      "name": "string",
      "id": "string",
      "externalId": "string"
    },
    "cloudNetwork": {
      "srl": "string",
      "name": "string",
      "id": "string",
      "externalId": "string"
    }
  },
  "assessmentPassed": true,
  "hasErrors": true
}
```


## Managing rule bundles
Note: the recommended way to mange bundles is via the Dome9 UI as it provides rule-builder, and built-in rule validations. However this can be done via API too.
Please contact us if you wish to manage rules via API - as we would like to better understand the use-cases.


