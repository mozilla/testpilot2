/* code is bsd.  */

"use strict"

const observer = require("observer-service");
const timers = require("timers");
var interval = 1000;  // 500 ms.


/* 
discussion:

if one really wanted to measure life and death of the browser it would be
better to listen to other messages, such as "quit-application"

see:  https://developer.mozilla.org/en/Observer_Notifications
*/

// https://developer.mozilla.org/en/nsIObserver
// aSubject:  thing it's happening to
// aTopic:  string message
// aData:  auxiliary data

/* can't tease out * topics easily!  CF:  https://bugzilla.mozilla.org/show_bug.cgi?id=744514 */
/* the 'this' in log_it, is a constructed observer instance from addon-sdk */
var log_it = function (subject,data){console.log("OBSERVED",subject,data,"TOPIC:", this.topic)};
observer.add("heartbeat",log_it);

var keepsending = true;
var intervalid = timers.setInterval(function() {
   if (! keepsending) { timers.clearInterval(intervalid); } // how one clears intervals.
   var subject = {"stillalive":  true};
   console.log("about to notify:", JSON.stringify(subject));
   observer.notify("heartbeat",subject);
}, interval);
