/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
