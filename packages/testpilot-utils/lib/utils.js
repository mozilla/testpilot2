// TESTPILOT-UTILS
"use strict";

const { Cu } = require("chrome"),
      { AddonManager } = Cu.import("resource://gre/modules/AddonManager.jsm", {}),
      ObserverService = require("observer-service"),
      { id } = require("self");

const JETPACK2_ID = "testpilot2@mozilla.org";

// This is kind of lame but I don't want to block the module loading so we'll
// buffer up the items we get until we can check if the jetpack add-on is installed
// NOTE that we only do buffering on initial load, if you've been running for a while
// and install TP later you'll only get events from that point on
var buffer = true;
var notifications = [];

var isTestPilotInstalled = false;

function setIsTestPilotInstalled(addon, installed) {
  if (addon.id == JETPACK2_ID) {
    isTestPilotInstalled = installed;
  }
}

var AddonListener = {
  onInstalled : function onInstalled(addon) {
    setIsTestPilotInstalled(addon, true);
  },
  onUninstalled : function onUninstalled(addon) {
    setIsTestPilotInstalled(addon, false);
  }
};

AddonManager.addAddonListener(AddonListener);

AddonManager.getAllAddons(function(aAddons) {
  // look through all the aAddons of {{AMInterface("Addon")}} objects for jetpack
  aAddons.some(function(addon) {
    setIsTestPilotInstalled(addon, true);
    return isTestPilotInstalled;
  });

  // stop the buffering we may have been doing
  buffer = false;

  // send out the buffered notifications
  while(notifications.length) {
    // take from the top and send out the notifications in the order we got them in
    exports.notify(notifications.shift());
  };
});

exports.notify = function(subject) {
  //console.log(id, " to notify ", JSON.stringify(subject), isTestPilotInstalled);
  if (buffer) {
    notifications.push(subject);
  }
  if (isTestPilotInstalled) {
    ObserverService.notify(id, subject);
  }
}
