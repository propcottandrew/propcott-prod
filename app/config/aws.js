var aws = require('aws-sdk');

aws.config.accessKeyId = process.env.AWS_KEY;
aws.config.secretAccessKey = process.env.AWS_SECRET;
aws.config.region = process.env.AWS_REGION;
aws.config.apiVersions = {
	dynamodb: '2012-08-10',
	s3: '2006-03-01'
};
