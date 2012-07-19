"use strict";

const {Cu} = require("chrome");
const { AddonManager } = Cu.import("resource://gre/modules/AddonManager.jsm");

/* usage

AddonManager = require("AddonManager");
AddonManager.getInstallForURL(
    "http://localhost:5000/heartbeat/heartbeat.xpi"
    , function(aInstall) {  

  // aInstall is an instance of {{AMInterface("AddonInstall")}}  
  aInstall.install();  
  console.log("yep!");
}, "application/x-xpinstall"); 



eventually, it would be nice to wrap this better, a la

    api-utils/lib/xhr.js



maybe use:

https://github.com/ochameau/addon-builder-helper/blob/master/lib/addon-install.js
*/


exports.AddonManager = AddonManager;
