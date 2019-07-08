# AWS Mongo Backup Scheduler
This project is a [Serverless](https://serverless.com/) template that enhance auto-backup for MongoDB databases.

It creates a CloudWatch Scheduler that triggers a lambda function then the lambda function connects with MongoDB, creates the dump and upload it to S3.
S3 bucket includes lifecycle with Glacier transition (7 days as default) and expiration date (180 days as default)
It also created a new SNS topic for error handling then you can subscribe to it.

## Using the template
Note: you must have Serverless installed.
1. Create your new serverless project using this template url

	    sls install --url https://github.com/alcasas/aws-s3-mongo-backup --name my-mongo-backup
	`--name` Is used for your service name

2. Install dependencies

	    yarn install
	or
	
		npm install
3. Deploy the stack to AWS

	    sls deploy --mongo-uri "mongodb://your-mongo-db" --bucket your-dump-bucket --email your@mail.com

## Deploy options

 - `--mongo-uri` : Is the mongodb url to connect  with (required)
 - `--bucket`: Is the bucket where dumps will be saved (required)
	 - Remember that bucket name must be unique in AWS (globally)
 - `--email` : Is the email used to create a new subscription (optional)
 - `--profile`: If you have more than one aws profile in your system you can choose (this is serverless option and not required)
 - `--region`: Region where resources will be created (not required us-west-2 by default)

## Additional changes
in `serverless.yml` file you can change whatever you want

 - Schedule time
 - Expiration date for dump files
 - Transition time for Glacier
 - Even if you already have a bucket you can modify the file to point to your existing bucket

## Resources
In your AWS account you'll see this new resources

 - Lambda function for MongoDB dump | AWS::Lambda::Function
 - Lambda log stream | AWS::Logs::LogGroup
 - New lambda version | AWS::Lambda::Version
 - Bucket for stack deployment | AWS::S3::Bucket
 - Your specified bucket, where dumps will be saved | AWS::S3::Bucket
 - IAM Role for the stack | AWS::IAM::Role
 - Schedule rule | AWS::Events::Rule
 - Schedule permissions | AWS::Lambda::Permission
 - SNS Topic for errors | AWS::SNS::Topic
 - If you specify an email for the error subscription then a new subscription will be created | AWS::SNS::Subscription (you have to accept the subscription in the given email)

## Extras 
 - Lambda uses node environment
 - Created from aws-nodejs-typescript template
 - `src/mongo.ts` has the backup functionality
 - [s3-upload-stream module](https://www.npmjs.com/package/s3-upload-stream)
 - [mongodb-backup-4x module](https://www.npmjs.com/package/mongodb-backup-4x)