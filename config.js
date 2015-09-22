// The default admin Id. Change this to sysadmin or president's information
var config = {};
config.adminId = "000000000";
config.adminName = "Admin";
config.internalSecret = '45kybfg89l4y89lb5kymg8rl';
config.externalSecret = 'aopr8bsr28ga786noytchons';
config.failsBeforeLockout = 5;
config.lockoutLength = 30; // in seconds
config.defaultLabMonitorPassword = "labMonitor2015";
module.exports = config;
