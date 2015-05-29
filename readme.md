<img src="https://lh3.googleusercontent.com/HpyyLAiSwiH_mECdaYMDraX7w9MpW4ET3K38xMSMdBRmEszdZaOApbrRnkN9E0vTaifm5A=w1342-h587" alt="" width="300" />

# Propcott <br><em><small>Reinventing Boycotts</small></em>

[![Join Gitter Chat](https://img.shields.io/badge/GITTER-join%20chat-green.svg)](https://gitter.im/evankennedy/propcott)

## Testing

This will allow you to directly access my development computer. The server will only be running for small portions of the day, but it may be useful before we purchase a server. Don't share this address.

> http://24-205-115-123.dhcp.hspr.ca.charter.com/

Username: `propcott`<br>
Password: `(same as google account)`

## Roadmap

* **100%** ~~Fresh Laravel 5 installation~~
* **67%** Implement and test social network integration *(Need to pick new OAuth provider and integrate into framework. This should be marked for after CP1 unless time allows)*
 * ~~Facebook~~
 * ~~Twitter~~
 * Google *(not working. may be due to local environment. will come back to this once placed on server)*
* **80%** Create account management panel
 * ~~Information Edit~~ (not avatar upload yet)
 * ~~Account delete~~
 * Account merge *(pushed to before CP1)*
 * ~~Connect social~~
 * ~~Disconnect social~~
* **0%** Create Propcott data structure
* Seed database with dummy data
* Build Blade *master* template
* Build Blade templates
 * Public Home
 * Personal Dashboard</font>
 * Account creation and authentication
 * Account management pages
 * Propcott view
 * Propcott list (no filters yet)

* **_Checkpoint 1:_** Full user authentication and basic Propcott browse functionality<br>*Expected: 6/5/2015*<br>*Actual: -*

* _Decide future roadmap after checkpoint_
* Eventually...
 * Production code freeze going into close beta

## Development

_Requires *AMP (like [XAMPP](https://www.apachefriends.org/)), [Composer](https://getcomposer.org/), and [Git](https://git-scm.com/)._

<pre>
git clone "https://github.com/evankennedy/propcott.git" propcott
(windows) copy .env.copy .env
(mac/linux) cp .env.copy .env
composer install
</pre>

Update .env file with new information.
