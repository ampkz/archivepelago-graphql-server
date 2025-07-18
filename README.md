
# Archivepelago - Server

This is the back-end of Archivepelago, a project on the transmission and translation of notions of sexuality and gender by mapping networks of queer writers and artists.

Although not required, the server runs on Ubuntu 24.04 through [Digital Ocean](https://www.digitalocean.com/ "Digital Ocean"). The following code is targeted to Ubuntu 24.04 within a Digital Ocean droplet; if using a different operating system or service provider, please adjust accordingly.

## Server Requirements

### Basic Server setup

#### Node.js

The server requires Node.js v22. Follow the instructions below to set up the node environment, being sure to install the correct version of Node.js (22.x):

* [Install Node.js on Ubuntu:](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions "Node.js on Ubuntu")
  ```bash
  cd ~
  curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
  sudo -E bash nodesource_setup.sh
  sudo apt install -y nodejs
  ```
* Verify the installation: 
  ```bash
  node -v
  ```
  
* `cd` into archivepelago-server's main directory and run `npm install`
* Rename `.env-keys` to `.env`
* In your `.env` file, update `TOKEN_SECRET=CHANGE_ME` with a long series of random characters.
* In your `.env` file, update `AUTH_REALM=CHANGE_ME` with the realm used for which the api uses the login information (e.g. "Archivepelago Server API").

#### Neo4j

The server requires Neo4j v5.26.1 Enterprise. You can get a Neo4j enterprise license through their [startup program](https://neo4j.com/startup-program/ "Neo4j Startup Program").

Follow the instructions below to install Neo4j, being sure to install the correct version (5.26.1):
* [Install Neo4j:](https://neo4j.com/docs/operations-manual/current/installation/linux/debian/ "Neo4j")
  * Add OpenJDK's repository:
    ```bash
    sudo add-apt-repository -y ppa:openjdk-r/ppa
    sudo apt update
    ```
  * Add Neo4j's repository:
    ```bash
    wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/neotechnology.gpg
    echo 'deb [signed-by=/etc/apt/keyrings/neotechnology.gpg] https://debian.neo4j.com stable 5' | sudo tee -a /etc/apt/sources.list.d/neo4j.list
    sudo apt update
    ```
  * Enable `universe` repository
    ```bash
    sudo add-apt-repository universe
    ```
  * Install Neo4j Enterprise Edition:
     ```bash
     sudo apt install neo4j-enterprise=1:5.26.1
     ```
     You will be prompted to accept the license agreement. If you obtained a license through the Neo4j Startup Program, select option '3'; otherwise, select '2'.
     
* [Set Initial Password:](https://neo4j.com/docs/operations-manual/2025.01/configuration/set-initial-password/ "Neo4j Set Initial Password")
  Before starting neo4j, you need to set an initial password (replacing newPassword with your password):
  ```bash
  cd /bin
  neo4j-admin dbms set-initial-password newPassword
  ```
  * In your `.env` file, update the key `NEO4J_PWD=CHANGE_ME` to your new password.

* [Install the APOC Plugin:](https://neo4j.com/docs/apoc/current/installation/ "Install the APOC plugin")
  * Move or copy the APOC jar file from the `$NEO4J_HOME/labs` directory to the `$NEO4J_HOME/plugins` directory:
    ```bash
    sudo cp /var/lib/neo4j/labs/apoc-5.26.1-core.jar /var/lib/neo4j/plugins
     ```
  * Start Neo4j:
    ```bash
    sudo neo4j start
    ```
* Enable Neo4j on startup:
    
  Try:
  ```bash
  sudo systemctl start neo4j
  sudo systemctl status neo4j
  ```
  If it failed to start, saying that the configuration file validation failed, you may need to change ownership of the folder where the logs are kept:
  ```bash
  sudo chown neo4j:adm -R /var/log/neo4j
  ```

  After changing the folder's owner, try to start the neo4j service and check its status again. If successful, enable neo4j to start on startup:

  ```bash
  sudo systemctl enable neo4j
  ```

  If unsuccessful, make sure `/etc/neo4j` and `/var/lib/neo4j` are owned by `neo4j:adm`.

#### Initialize Server 

To initialize the server, `cd` into archivepelago-server's main directory and run `npm install` to install the dependencies required for the server. Then run `node server-init.js` to initialize the database and create an initial admin user. Finally, run `npm run start` to start the server.

### NGINX Reverse Proxy
Although not required, the deployment server uses NGINX as a reverse proxy to improve performance and security. Follow the instructions below for basic setup.

* [Default Install and Configuration of NGINX:](https://www.sitepoint.com/configuring-nginx-ssl-node-js/ "NGINX with Node.js")
  ```bash
  sudo apt update
  sudo apt install nginx
  ```
  * Create the NGINX server block file and open it with your preferred text editor (in this case nano). Be sure to replace `yourdomain.org` with your registered domain name:
    ```bash
    sudo touch /etc/nginx/sites-available/yourdomain.org
    sudo nano /etc/nginx/sites-available/yourdomain.org
    ```
  * Enter the following and save the file to create a `server` block (replace `3001` with the port number your node app uses if you've changed it; replace `yourdomain.org` with your registered domain name; replace `/var/www` with the directory where you want to host your static files):
    ```text
    upstream node_server{
      server localhost:3001;
    }

    server{
      listen 80;
      server_name yourdomain.org www.yourdomain.org;

      root /var/www;

      location / {
        try_files $uri @node_server;
      }

      location @node_server {
        proxy_pass http://node_server;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
      }
    }
    ```
   * Make sure there are no syntax errors in your NGINX files
     ```bash
     sudo nginx -t
     ```
   * Enable your site:
     ```bash
     sudo ln -s /etc/nginx/sites-available/yourdomain.org /etc/nginx/sites-enabled/
     ```
   * Restart NGINX
     ```bash
     sudo service nginx restart
     ```
### Security

Your deployment server should be secured with SSL. See [Securing NGINX With Let's Encrypt](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04 "NGINX Security") if using NGINX.

### PM2 Daemon Process Manager

The deployment server also uses PM2 to manage the node server process. Again, this is not required but recommended to help further manage and keep the server online. To install PM2, simply run `npm install pm2 -g`. To use PM2, `cd` into archivepelago-server's main directory and run `pm2 start index.js`.

## Open Source (GPLv3) License

    Copyright (C) 2025 Andrew M. Pankratz & Corey D Clawson

    This program is free software: you can redistribute it and/or modify it under the terms of the GNU General 
    Public License as published by the Free Software Foundation, either version 3 of the License, or (at your 
    option) any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
    
    See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
