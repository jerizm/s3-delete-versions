#!/usr/bin/env node

const prompt = require('prompt');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

let bucketName = process.env.BUCKETNAME;

const maxKeys = 5;

const deleteObjects = async (continuationToken) => {
  const params = {
    Bucket: bucketName,
    MaxKeys: 1000
  };

  if (continuationToken) {
    params.ContinuationToken = continuationToken;
  }
  const content = await s3.listObjectsV2(params).promise();

  const toDelete = content.Contents.map(content => {
    return { Key: content.Key };
  });

  if (toDelete.length > 0) {
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: toDelete,
        Quiet: false
      }
    };
    const deleteResult = await s3.deleteObjects(deleteParams).promise();
  }
  if (content.NextContinuationToken) {
    console.log(content.Contents[0].Key);
    deleteObjects(content.NextContinuationToken);
  }
};

const deleteObjectVersions = async (keyMarker, versionId) => {
  const params = {
    Bucket: bucketName,
    MaxKeys: 1000
  };

  if (keyMarker && versionId) {
    params.KeyMarker = keyMarker;
    params.VersionIdMarker = versionId;
  }

  const vers = await s3.listObjectVersions(params).promise();

  const toDelete = vers.Versions
    .filter(ver => ver.VersionId)
    .map(ver => {
      return {
        Key: ver.Key,
        VersionId: ver.VersionId
      };
    }).concat(
      vers.DeleteMarkers
      .filter(ver => ver.VersionId)
      .map(ver => {
        return {
          Key: ver.Key,
          VersionId: ver.VersionId
        };
      }));
  if (toDelete.length > 0) {
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: toDelete,
        Quiet: false
      }
    };
    const deleteResult = await s3.deleteObjects(deleteParams).promise();
    console.log(deleteResult.Errors);
  }
  if (vers.NextKeyMarker && vers.NextVersionIdMarker) {
    console.log(vers.NextKeyMarker, vers.NextVersionIdMarker);
    deleteObjectVersions(vers.NextKeyMarker, vers.NextVersionIdMarker);
  }
};

prompt.start();

console.log('WARNING: This will delete all objects in your bucket!!!');

prompt.get([{
  name: 'bucketname',
  required: true,
  conform: (val) => {
    return true;
  }
}], (err, result) => {
  bucketName = result.bucketname;
  deleteObjects();
  deleteObjectVersions();
});

