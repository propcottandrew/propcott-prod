# Propcott

[![Join Gitter Chat](https://img.shields.io/badge/GITTER-join%20chat-green.svg)](https://gitter.im/evankennedy/propcott)

## Testing

This will allow you to directly access my development computer. The server will only be running for small portions of the day, but it may be useful before we purchase a server. Don't share this address.

> http://24-205-115-123.dhcp.hspr.ca.charter.com/

Username: `propcott`<br>
Password: `(same as google account)`

## Roadmap

* **100%** ~~Fresh Laravel 5 installation~~
* **67%** Implement and test social network integration *- Need to pick new OAuth provider and integrate into framework. Pushed to ~CP1*
 * ~~Facebook~~
 * ~~Twitter~~
 * Google *not working. may be due to local environment. will come back to this once placed on server*
* **80%** Create account management panel
 * ~~Information Edit~~ *- not avatar upload yet*
 * ~~Account delete~~
 * Account merge *- pushed to ~CP1*
 * ~~Connect social~~
 * ~~Disconnect social~~
* **100%** ~~Create Propcott data structure~~
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

## Development

### Startup AWS machine

This will install development tools, make our custom php build, and grab the most recent propcott application version.

On AWS Linux x64, SSH in and run:

<pre>sudo su
cd /etc/ssh/
vi sshd_config</pre>

Comment out any `PermitRootLogin` lines and add:

<pre>PermitRootLogin without-password</pre>

Save, exit, then run:

<pre>/etc/init.d/sshd reload
yum groupinstall "Development Tools"
yum install mysql mysql-server libxml2-devel openssl-devel bzip2-devel curl-devel libmcrypt libmcrypt-devel
VERSION=5.6.9
cd /usr/local/src
wget http://www.php.net/distributions/php-$VERSION.tar.gz
tar zxvf php-$VERSION.tar.gz
cd /usr/local/src/php-$VERSION
PHP_CONF="--prefix=/usr/local \
    --with-config-file-path=/etc \
    --enable-maintainer-zts \
    --enable-fpm \
    --enable-inline-optimization \
    --disable-debug \
    --with-mcrypt \
    --with-zlib \
    --enable-mbstring \
    --with-curl \
    --with-bz2 \
    --enable-zip \
    --enable-sockets \
    --enable-sysvsem \
    --enable-sysvshm \
    --with-mhash \
    --with-pcre-regex \
    --with-gettext \
    --with-mysql \
    --with-mysqli \
    --enable-bcmath \
    --enable-calendar \
    --enable-ftp \
    --enable-soap \
    --with-pdo-mysql \
    --enable-json \
    --enable-libxml \
    --with-openssl \
    --with-openssl-dir=/usr/bin/openssl \
    --with-pear"
./configure $PHP_CONF
make
make install
cp php.ini-development /etc/php.ini</pre>

## Server Switches

I'll discuss starting the ReactPHP version with a built in process manager and nginx load balancing, and a way to fallback to the original application state with nginx+fastcgi. I want both because the ReactPHP version will be much faster but may have issues until fully tested. We should be able to fallback at a moments notice with minimal service interruption.

## Below is for notes. It will be rewritten

Follow this to develop/test locally. Social network authentication will not work using this method, but you can register normally.

### Windows

_Requires [PHP](http://windows.php.net/download), [Composer](https://getcomposer.org/), and [Git](https://git-scm.com/)._

1. [Add PHP to your PATH](http://php.net/manual/en/faq.installation.php#faq.installation.addtopath)
2. Open up command prompt (cmd.exe) and navigate to the folder you want to download propcott to. A new folder will be added underneath called `propcott`.
3. Enter the following:
<pre>
git clone "https://github.com/evankennedy/propcott.git" propcott
cd propcott
copy .env.copy .env
composer install
php artisan migrate
</pre>
4. Keep the command prompt open.
5. Update .env file with new information.
6. Enter the following:
<pre>
php -S [localhost:8000](http://localhost:8000/)
</pre>

Go to `localhost:8000` in your web browser.

### Linux/Mac

_Requires [PHP](http://php.net/downloads.php), [Composer](https://getcomposer.org/), and [Git](https://git-scm.com/)._

1. Open a terminal, navigate to the folder you want to download propcott to. A new folder will be added underneath called `propcott`.
2. Enter the following:
<pre>
git clone "https://github.com/evankennedy/propcott.git" propcott
cd propcott
cp .env.copy .env
composer install
php artisan migrate
</pre>
3. Keep the terminal open
4. Update .env file with new information.
5. Enter the following:
<pre>
php -S [localhost:8000](http://localhost:8000/)
</pre>

