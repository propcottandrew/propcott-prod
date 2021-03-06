var aws = require('aws-sdk');

module.exports.dynamo = new aws.DynamoDB();
module.exports.s3     = new aws.S3();
module.exports.ses    = new aws.SES();

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
