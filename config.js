// The default admin Id. Change this to sysadmin or president's information
var config = {};
config.adminId = "000000000";
config.adminName = "Admin";
config.adminUsername = "admin";
config.defaultAdminPassword = "admin";
config.cookieSecret = 'aopr8bsr28ga786noytchons';

config.failsBeforeLockout = 5;
config.lockoutLength = 30; // in seconds
config.nukeOnRestart = false; // debugging purposes
config.usernameRegex = /^[\d\w]{4,}$/; // succeeds if match, allows letters, numbers, and underscores
config.nameRegex = /^[a-zA-Z'-\s]*$/; // succeeds if match, allows letters and spaces

config.labMonitorPassphrase = "labMonitor2015";
config.execPassphrase = "execsAreExecs";
config.adminPassphrase = "adminzRule";

config.internalPort = 8080;
config.externalPort = 8181;

module.exports = config;
