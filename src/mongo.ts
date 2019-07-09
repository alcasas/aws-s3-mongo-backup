import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3, SNS } from 'aws-sdk';
import mongoDump from 'mongodb-backup-4x';
import s3UploadStream from 's3-upload-stream';
import 'source-map-support/register';

export const backup: APIGatewayProxyHandler = (_event, _context, callback) => {

  const publishSNS = (error:Error)=>{
    const errorDisplay = error.name ? error.name : 'Error';
    const errorMsgDisplay = error.message ? error.message : 'Unexpected error.';
    if(error){
      if(process.env.SUBSCRIPTION_EMAIL !== 'none'){
        const sns = new SNS(aswConf);
        sns.publish({
          TopicArn: process.env.SNS_ERROR_ARN,
          Message: `${errorDisplay}: ${errorMsgDisplay}. Please go to you AWS account and look for lambda logs or contact your administrator.`,
          Subject: `Error in service ${process.env.SERVICE_NAME}.`,
        }, ()=> callback(error) );
      } else {
        callback(error);
      }
    }
  };

  const aswConf = {
    accessKeyId     : process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken    : process.env.AWS_SESSION_TOKEN,
    region          : process.env.REGION
  };
  
  // connect s3 with s3Stream
  const s3Stream = s3UploadStream(new S3(aswConf));

  // setup s3Stream
  const uploadToS3 = s3Stream.upload({
    Bucket: process.env.AWS_S3_DUMP_BUCKET,
    Key   : `${process.env.SERVICE_NAME}-${new Date().toISOString()}.tar`
  });

  //stream events
  uploadToS3.on('error', publishSNS);
  uploadToS3.on('uploaded', (body: Object)=>{
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(body)
    });
  });

  // create the dump
  mongoDump({
    uri     : process.env.MONGO_URI,
    root    : __dirname,
    metadata: true,
    stream  : uploadToS3,
    options : {
      useNewUrlParser: true
    },
    callback: publishSNS
  });

}
