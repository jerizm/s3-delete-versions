# Delete an S3 Bucket's Object versions and Delete Markers

I was trying to delete a bucket but couldn't find anyway to delete all versions.

This little node script should help.

## To Run

Uses the default [AWS credentials chain](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CredentialProviderChain.html). 

Requires node v8.

```
npm install 
BUCKETNAME=bucket ./index.js
```
