const request = require("request");

exports.performAssessment = function  (username, password, req,err,success) {
    var options = {
        uri: "https://api.dome9.com/v2/assessment/bundle",
        auth: {
            user: username,
            pass: password,
        },
        method:"POST",
        body:req,
        json:true
    };

    request(options, function (error, response, body) {
        if (error || response.statusCode >= 400) {
            err(error || body);
        }
        else {
            if(success && typeof(success) === "function")
                success(body);
        }
    });
}

exports.AssessmentRequest = function AssessmentRequest(bundleId,cloudAccountId){
    return {
        CloudAccountId: cloudAccountId,
        Id: bundleId,
        Region:""
    }
}