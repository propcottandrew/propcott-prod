data.propcott.com
	/drafts
	/propcotts
		/{id}
			full.json - propcott and updates
			text.json - propcott text only (for search results)
	/


up to 5 global and 5 local secondary indexes


==
propcotts (published propcotts)
==
type - primary hash (published / unpublished)
id - primary range
created - local range
support_daily - local range
support_weekly - local range
support_monthly - local range
support_all - local range
--
user_id - global hash with range created
==
get all propcotts by a user
get all propcotts sorted by date
get all propcotts sorted by support
!get all propcotts in an industry by date
!get all propcotts in an industry by support
!get all propcotts by a target by date
!get all propcotts by a target by support
get list of all targets sorted alphabetically
get list of all targets sorted by popularity
==

will need a daemon to go through each propcott and update the values. we will auto-scale the throughput during quiet times to allow for this to run quicker.


==
support
==
propcott_id - primary hash
user_id - primary range
created - local range
==
get all users who support a propcott
get all supports for a propcott with date range
==
list of propcotts a user supports is available in S3
possibly set up a gsi for user_id/created to allow for that data to be retrieved through dynamo
==


==
users
==
id - primary hash ({provider}:{id}/local:{email})
created - local range
password
main_id
session (just small amount of info that goes into the session so we don't go to S3 on login)
==
get user by id
get user by email
get user by social account id
==
ensure none by email exists when writing
info in S3
==

social connect
	read item expecting it to exist
		if yes, check if it has a main_id and fetch if it does
		if not, put the item


==
cache
==
section - primary hash
id - primary range
expires - local range
value
serialized
==
use cache for sessions, queue items
==

words
word - primary hash
propcott_id - primary range
appearance - local range (local weight of word in document)
weight - local range (global weight. appearance * propcott support decimal)

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


