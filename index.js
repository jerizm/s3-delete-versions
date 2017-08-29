#!/usr/bin/env node

constAWS = require('aws-sdk');

const s3 = new AWS.S3();

const bucketName = process.env.BUCKETNAME;

const maxKeys = 5;

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
  console.log(vers.NextKeyMarker, vers.NextVersionIdMarker);
  deleteObjectVersions(vers.NextKeyMarker, vers.NextVersionIdMarker);
};

deleteObjectVersions();
