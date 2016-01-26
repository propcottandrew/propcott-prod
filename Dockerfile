FROM centos:latest

# Update packages
RUN yum update -y

# Install software
RUN yum install -y git
RUN curl -sL "https://rpm.nodesource.com/setup_5.x" | bash -
RUN yum install -y nodejs
RUN npm install -g pm2

# Create server directory
RUN mkdir -p /var/www
WORKDIR /var/www

# Install app
RUN git clone "https://evankennedy:!\\$42eKsC@github.com/evankennedy/propcott.git" www.propcott.com
WORKDIR /var/www/www.propcott.com

# Install app dependencies
RUN npm install

# Create user
RUN useradd evan
RUN echo "evan:!$42eKsC" | chpasswd

# Add user to group
RUN groupadd www
RUN usermod -a -G wheel,www evan

# Set permissions
RUN chown -R evan:www /var/www
RUN chmod g+s /var/www
RUN setfacl -d -m g::rwx /var/www
RUN setfacl -d -m o::r /var/www

# Start Application
EXPOSE 80
RUN pm2 start index.js
