Components.utils.import("resource://gre/modules/AddonManager.jsm");  

/*
AddonManager.getAllAddons(function(aAddons) { 
    aAddons.forEach(function(addon) {
        console.log(addon.name, addon.id);
    })
  }
 );
*/



AddonManager.getInstallForURL(
    "http://localhost:5000/heartbeat/heartbeat.xpi"
    , function(aInstall) {  

  // aInstall is an instance of {{AMInterface("AddonInstall")}}  
  aInstall.install();  
  console.log("yep!");
}, "application/x-xpinstall"); 




exports.AddonManger = AddonManager;
