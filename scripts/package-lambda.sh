#!/bin/bash

PROJ_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
mkdir -p $PROJ_DIR/tmp
UPLOAD=$PROJ_DIR/tmp/lambda.zip
zip -r -X $UPLOAD *.js node_modules 
#aws lambda update-function-code  --function-name cloud-supervisor --zip-file fileb://$UPLOAD