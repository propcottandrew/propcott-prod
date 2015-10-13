var aws = require('aws-sdk');

aws.config.accessKeyId     = process.env.AWS_KEY;
aws.config.secretAccessKey = process.env.AWS_SECRET;
aws.config.region          = process.env.AWS_REGION;
aws.config.apiVersions = {
	dynamodb: '2012-08-10',
	s3:       '2006-03-01'
};

module.exports.dynamo = new aws.DynamoDB();
module.exports.s3     = new aws.S3();

module.exports.to = (attribute) => {
	if(attribute === null || attribute === undefined) return {NULL: true};
	if(typeof attribute == 'number')                  return {N: attribute.toString()};
	if(typeof attribute == 'boolean')                 return {BOOL: attribute};
	return {S: JSON.stringify(attribute)};
};

module.exports.from = (item) => {
	if(item.NULL !== undefined) return null;
	if(item.BOOL !== undefined) return item.BOOL;
	if(item.N    !== undefined) return Number(item.N);
	return JSON.parse(item.S);
};
