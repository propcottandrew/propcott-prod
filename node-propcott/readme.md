# Propcott

* Every list holds a maximum of 65,535 items. With 64-bit integers for propcott IDs, that leaves each list at 512KB. Only a portion of this is cached on each instance. If requesting a page outside that cache, we request a specific byte range from the list for the page. When the instance caches part of the file, it should get the full file size to determine how many items are in the list.

## Content Delivery Layer

* S3 Public Bucket [static.propcott.com](http://static.propcott.com)
* Elastic Beanstalk [www.propcott.com](http://www.propcott.com)

*Will eventually use CloudFront.*

## Compute Layer

Lambda currently does most of the heavy-lifting. We don't consider our EC2 instances as part of the compute layer because they really only authenticate requests and pull resources together to create each page.

### Lambda

Lambda handles much of our computational tasks.

The following steps should be executed by Lambda functions daily. If a step reaches 30 seconds, it should stop processing, save LastEvaluatedKey, and send an SNS message for the topic the step was on.

1. Query `Propcotts` table for `Type = Propcott AND AllSupport reverse`. For each item:
	* Get all support from `Supporters` table within this month
	* Keep counters for daily, weekly, monthly
	* Update `Propcotts` table to correct values
2. Query `Propcotts` table for `Type = Propcott AND AllSupport reverse limit 65535`
	* Build explore `Hot - All Time` list and save to S3
	* *in progress* Keep track of industry. Will do top 50 results (5 pages) per industry.
	* *in progress* Keep track of target. Will do top 50 results (5 pages) per target.
	* *in progress* Build explore `Hot - Industry` rendered pages for top 5 pages of each industry and save to S3
	* *in progress* Build explore `Hot - Target` rendered pages for top 5 pages of each target and save to S3
3. Query `Propcotts` table for `Type = Propcott AND MonthlySupport reverse limit 65535`
	* Build explore `Hot - Monthly` list and save to S3
4. Query `Propcotts` table for `Type = Propcott AND WeeklySupport reverse limit 65535`
	* Build explore `Hot - Weekly` list and save to S3
5. Query `Propcotts` table for `Type = Propcott AND DailySupport reverse limit 65535`
	* Build explore `Hot - Daily` list and save to S3

In the future, pageviews will be tracked by sending data in groups of 10 to SQS then processed and entered into the DB by Lambda.

## Data Layer

### S3 Buckets

#### static.propcott.com

Public bucket to hold static javascript, css, and image files for users, propcotts, and the site.

#### propcotts.data.propcott.com

Holds all propcott data. (Drafts, Propcotts, Victories, Closed)

* {id}
	* full.json - propcott and updates
	* full.html - full rendered view
	* small.html - small rendered view for explore/search pages
	* text.json - propcott text only (for search results excerpt text)

#### users.data.propcott.com

Holds all `encrypted` user data.

#### cache.data.propcott.com

Holds a cache of rendered pages and lists. Things like explore pages and common search results pages. Will need to have some public functionality for mobile apps in the future.

### DynamoDB Tables

We use DynamoDB as an index for data stored in S3 because it's much faster than a traditional RDBMS and doesn't require an instance to run on. We also separate the data indexing from the actual data so we aren't constrained to any particular data structure. As long as we structure our data index properly, we will be able to seemingly infinitely scale our data layer horizontally.

#### Propcotts

##### Required Functionality

* Get propcott by Id
* Get all propcotts sorted by date
* Get all propcotts sorted by support
* Get list of all targets sorted alphabetically
* Get list of all targets sorted by popularity

##### Throughput

* Table: `Read: 3 - Write: 5`
* Global 1: `Read: 6 - Write: 5`

##### Structure

Name			| Type		| Indexes
-------         | -------   | -------
Status			| String	| Primary Hash
Id				| Number	| Primary Range<br>Global 1 Hash<br>(SAll, SPrevious)
SDay			| Number	| Local Range
SWeek			| Number	| Local Range
SMonth			| Number	| Local Range
SAll			| Number	| Local Range
SPrevious		| Number	|
Industry		| String	|
Target			| String	|

#### Credentials

Stores info to retrieve an account Id based on a user's email & password or provider id. Key is:

* `Email` for local use
* `Provider.Id` for use with external providers

##### Required Functionality

* Get a user by provider & Id

##### Throughput

* Table: `Read: 5 - Write: 2`

Reads occur when:

* User attempts to log in
* User connects a social network account

Writes occur when:

* User creates an account
* User Verifies a main account
* User connects a social account
* User changes password

##### Structure

Name			| Type		| Indexes
-------			| -------	| -------
Key				| String	| Primary Hash
Provider		| String	| Primary Range
Verified		| Number	| Local Range
Password		| String	|
Id				| Number	|

#### Supporters

Records the timestamp each time a user supports a specific propcott. Querying the primary hash `PropcottId`, we can find the total number of users supporting a propcott. Querying GSI1's hash `UserId`, we can find all propcotts a user supports sorted by support date.

##### Required Functionality

* Get a list of all supporters for a propcott
* Get a list of all supporters for a propcott within a date range
* (Implement Global Secondary Index to support this) Get a list of all propcotts a user supports sorted by support date

##### Throughput

* Table: `Read: 5 - Write: 5`

##### Structure

Name			| Type		| Indexes
-------         | -------   | -------
PropcottId		| Number	| Primay Hash
UserId			| Number	| Primary Range
Created			| Number	| Local Range
Previous		| Boolean	|

#### Store

Provides a generic way to store and retrieve key/value data with an optional Expires field. `Value` can be of any data type and an interface should be provided for transforming between JSON and AWS JSON. In the future, we may shift some data to other tables if performance declines.

This will be used by:

* Sessions
* Cache items
* Generating/incrementing UUIDs
* Incrementing/Decrementing targets/industries

To avoid `Key` conflicts between various store uses, each `Key` should have a prefix. The `Key` should be in the following format: `prefix:data` such as `session:Kdj38F02Fds` or `target:Walmart`.

##### Required Functionality

* Get a list of all items in a section
* Get an item based on section & key
* Provide an interface to map the proper data type so JSON can be stored as well as numbers for `increment` operations
* May need to move sessions to dedicated table in the future. Will see how performance is will range-based lookups

##### Throughput

* Table: `Read: 6 - Write: 8`

##### Structure

Name			| Type		| Indexes
-------         | -------   | -------
Key				| String	| Primary Hash
Expires			| Number	| Primary Range
Value			| Mixed		|

### SimpleDB

Future: Will implement full-text searching.

### Notes

session manager should redirect to login page and flash a message if it cannot find the session but there is a cookie for the session. That way any requests that rely on the user's session will be immediately halted.



On propcott create
	`Store`: `Key:target:{target}`, `ADD Value, 1`
	`Store`: `Key:industry:{industry}`, `ADD Value, 1`
	`Store`: `Key:targets`, `ADD Value, [{target}]`
On propcott update
	if target changed
		`Store`: `Key:target:{old_target}`, `ADD Value, -1`
		`Store`: `Key:target:{new_target}`, `ADD Value, 1`
		if `Key:target:{old_target}` is now 0
			Remove `Store`: `Key:target:{old_target}`
			`Store`: `Key:targets`, `DELETE Value, [{old_target}]`
	if industry changed
		`Store`: `Key:industry:{old_industry}`, `ADD Value, -1`
		`Store`: `Key:industry:{new_industry}`, `ADD Value, 1`
On support create
	Email
On user create
	Email
On update S3 propcott JSON
	render various versions

on register
	query db for 'local':email
		Create new UUID
		Create new user ('local':UUID)
		write to db expect not exist
		catch ConditionFailed
			email already registered

social connect
	if logged in
		read provider:provider.id expecting it to exist
	else
		read provider:provider.id expecting it to exist
			id = Item.Main || Item.Id
			Fetch user by id from S3
			Create session from user info
			catch ConditionException:
				Create new UUID
				Create new user ('local':UUID)
				Create new user (provider:provider.id) expect not exist and set main to UUID



in-memory layer holds supporters while they wait to be persisted.
in-memory layer writes to disk every 5s.

homepage/explore propcotts are fetched hourly (by sync, not interval)

each explore list holds 1,048,575 propcotts (20 bit int max)
new,today,week,month,alltime = 5,242,875 propcotts
5,242,875 * 20b = 104,857,500b = ~12.5MB
first x held in Buffer while full lists written to disk
need integer value for length of each list

each propcott preview needs:
attr		type	length	max bytes 	expected
title 		text	255		765
what 		text	255		765
target 		text	100		300
media_link	text	510		1,530
media_type
supporters	num 	-		8
total						<3kb		1kb

10 in Buffer (1 page) (50 total)
50 kb (150kb max)

1,000 on disk (100 pages) (500 total)
~5MB (~15MB max)

these lists should be held in S3 and SNS should be sent out whenever they are updated. They should be kept in a single file.




CSRF middleware
app.get('/form', [csrf, ...]);

Maintenance middleware
app.use(maintenance);

Authenticate middleware (wait, we need acl)
app.use(authenticate('guest'));
app.use(authenticate.can('read')); // can this know scope of object?
