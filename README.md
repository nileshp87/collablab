#WPI Collablab Internal Website
##Description
This site allows users to swipe in and out of the lab, and view the status of the lab from outside the lab. It is built using NodeJS/ExpressJS, and exposes an API that can be consumed by other applications.

##Dependencies
NodeJS - Runs the node code

npm - To grab all of the necessary node modules easily

Redis - Database backend

ForeverJS (Production)* - Will continuously restart script on crash

NodeMon (Development)* - Will run script until crash, and then wait for file change before restarting



\* Are recommended packages, they make things easier for their environment.

##Production Usage
  To use the site in a production setting, follow these steps (some commands may be debian centric and require conversion):
  1. Install dependencies:
    ```
    sudo apt install nodejs redis npm
    sudo npm install -g forever
    ```
    
  2. Clone the repository into some directory:
    `git clone git@github.com:nileshp87/collablab.git`

  3. Install the node dependencies:
    ```
    cd collablab
    npm install
    ```
  4. Modify config.js, especially:
    * Default admin credentials, generally should be set by sysadmin or president to their information.
    * Default passphrases, there's three and they should be changed from their default
    * cookieSecret, this should be random, I recommend generating a twelve character string from random.org or equivalent.
    * nukeOnRestart, this should be set to false.
    * externalPort, this should be set to 80.

  5. Add iptables rules to block communication to the server from anywhere but localhost on the configured internalPort (default: 8080)
    
    `sudo iptables -A INPUT -p tcp --destination-port 8080 -j DROP`

  6. Start with ForeverJS
    
    `forever start index.js`

##Development Usage
  To setup for development, the steps are slightly more straighforward.
  
  1. Install dependencies:
    ```
    sudo apt install nodejs redis npm
    sudo npm install -g nodemon
    ```
    
  2. Clone the repository into some directory:
    `git clone git@github.com:nileshp87/collablab.git`

  3. Install the node dependencies:
    ```
    cd collablab
    npm install
    ```
  
  4. Run nodemon on index.js:
    ```
    nodemon index.js
    ```
  
