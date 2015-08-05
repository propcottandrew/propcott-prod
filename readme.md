# Propcott

## S3 Buckets

### static.propcott.com

Public bucket to hold static javascript, css, and image files for users, propcotts, and the site.

### propcotts.data.propcott.com

Holds all propcott data. (Drafts, Propcotts, Victories, Closed)

* {id}
	* full.json - propcott and updates
	* full.html - full rendered view
	* small.html - small rendered view for explore/search pages
	* text.json - propcott text only (for search results excerpt text)

### users.data.propcott.com

Holds all `encrypted` user data.

### pages.data.propcott.com

Holds a cache of rendered pages. Things like explore pages and common search results pages.

## DynamoDB Tables

### UUID

Acts as an auto incrementer for unique IDs. Since `PutItem` has an atomic `Add` operation and the new value can be returned through `ReturnValues`, we can be sure no two items will have the same ID and all IDs will be integers of the lowest possible value.


#### Required Functionality

* Increment and return an integer based on a key

#### Throughput

* Table: `Read: 1 - Write: low`

#### Structure

Name			| Type		| Indexes
-------         | -------   | -------
Id				| String	| Primary Hash
Value			| Number	|

### Propcotts

#### Required Functionality

* Get all propcotts by a user
* Get all propcotts sorted by date
* Get all propcotts sorted by support
* Get all propcotts in an industry by date
* Get all propcotts in an industry by support
* Get all propcotts by a target by date
* Get all propcotts by a target by support
* Get list of all targets sorted alphabetically
* Get list of all targets sorted by popularity

#### Throughput

* Table: `Read: ? - Write: ?`
* Global 1: `Read: ? - Write: ?`
* Global 2: `Read: ? - Write: ?`
* Global 3: `Read: ? - Write: ?`

#### Structure

Name			| Type		| Indexes
-------         | -------   | -------
Type			| String	| Primary Hash
Id				| String	| Primary Range
Created			| Number	| Local Range<br>Global 1 Range
DailySupport	| Number	| Local Range
WeeklySupport	| Number	| Local Range
MonthlySupport	| Number	| Local Range
AllSupport		| Number	| Local Range<br>Global 2 Range<br>Global 3 Range
Creator			| String	| Global 1 Hash
Industry		| String	| Global 2 Hash
Target			| String	| Global 3 Hash

### Users

#### Required Functionality

* Get a user by provider & Id
* Get a user by email

#### Throughput

* Table: `Read: med/high - Write: low`

#### Structure

Name			| Type		| Indexes
-------			| -------	| -------
String			| Provider	| Primary Hash
String			| Id		| Primary Range
String			| Email		| Local Range
Number			| Created	| Local Range
String			| Password	|
String			| Main		|
Boolean			| Verified	|

### Supporters

Records the timestamp each time a user supports a specific propcott. Querying the primary hash `PropcottId`, we can find the total number of users supporting a propcott. Querying GSI1's hash `UserId`, we can find all propcotts a user supports sorted by support date.

#### Required Functionality

* Get a list of all supporters for a propcott
* Get a list of all supporters for a propcott within a date range
* Get a list of all propcotts a user supports sorted by support date

#### Throughput

* Table: `Read: low - Write: high`
* Global 1: `Read: ? - Write: ?`

#### Structure

Name			| Type		| Indexes
-------         | -------   | -------
PropcottId		| String	| Primay Hash
UserId			| String	| Primary Range<br>Global 1 Hash
Created			| String	| Local Range<br>Global 1 Range

### Cache

Provides a generic way to store and retrieve key/value data with an optional Expires field. `Value` can be of any data type and an interface should be provided for transforming between JSON and AWS JSON.


#### Required Functionality

* Get a list of all items in a section
* Get an item based on section & key
* Provide an interface to map the proper data type so JSON can be stored as well as numbers for `increment` operations

#### Throughput

* Table: `Read: high - Write: low/med`

#### Structure

Name			| Type		| Indexes
-------         | -------   | -------
Section			| String	| Primary Hash
Key				| String	| Primary Range
Expires			| Number	| Local Range
Value			| Mixed		|

## Notes



session manager should redirect to login page and flash a message if it cannot find the session but there is a cookie for the session. That way any requests that rely on the user's session will be immediately halted.





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

social connect
	read item expecting it to exist



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


