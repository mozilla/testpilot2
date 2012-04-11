/* 

this code is MPL licenced 

Author:  Gregg Lind
*/

/* TODOS::

* private browsing
* what if tp is turned off?  Should it remove the extensions it installed?  Confirm with the user?
* how to detect the end of experiements?  Make this robust to time zone changes, etc?

(and of course, finish, debug, and test the code!)
*/


"use strict";

const observer = require("observer-service");
const prefs = require("simple-prefs");
var simpleStorage = require('simple-storage');
const tabs = require("tabs");
const timers = require("timers");
const widgets = require("widget");
var windowUtils = require("window-utils");


console.log("testpilot main.js running.");

var RECORDNAME = "testpilot2";
if (!simpleStorage.storage[RECORDNAME])
  simpleStorage.storage[RECORDNAME] = [];


//https://developer.mozilla.org/en/XUL/notificationbox

var installed_extensions = [];

var notifications = require("notifications");
notifications.notify({
  title: "Jabberwocky",
  text: "'Twas brillig, and the slithy toves",
  data: "did gyre and gimble in the wabe",
  onClick: function (data) {
    console.log(data);
    // console.log(this.data) would produce the same result.
  }
});


var sample_config = {
    'simplesurveys' : 
        [
          {
            "url": "survey1", 
            "name": "Some survey 1", 
            "summary": "Here is the summary for survey1"
          }, 
          {
            "arms": [
              {
                "url": "url_arm1", 
                "locales": [
                  "en-US", 
                  "en-GB"
                ]
              }, 
              {
                "arm_id": "spanish", 
                "locale": "es-*", 
                "url": "url_arm2", 
                "summary": "Special Summary if you speak spanish"
              }, 
              {
                "url": "url_arm3"
              }
            ], 
            "name": "multiarm",
            "phone_home":  'some/url/that/will/get/posted/summary/data'
          }
        ],
    'experiments' : [
        {"id":"2012 preferences redesign",
         "addons" : ['addon url1'],
         "listen_to_addon":  true
        },
        {"id":"search type 3",
         "addons" : ['search_addon, v3'],
         "listen_to_addon":  false,  // default value
         "experiment":  "some/path/somewhere.js",
         "experiment_entry": "main",
         
         
        }
    ]
};                      


/* menu monitoring from beta/combined.js */
var sample_experiment_code = function() {
    /* Register menu listeners:
   * 1. listen for mouse-driven command events on the main menu bar: */
      let mainMenuBar = window.document.getElementById("main-menubar");
      this._listen(mainMenuBar, "command", function(evt) {
        let menuItemId = "unknown";
        let menuId = "unknown";
        if (evt.target.id) {
          menuItemId = evt.target.id;
        }   
        let node = evt.target;
        while(node) {
          if (node.tagName == "menupopup") {
            menuId = node.id;
            break;
          }   
          if (node.id && menuItemId == "unknown") {
            menuItemId = node.id;
          }
          node = node.parentNode;
        }
        record(menuId, menuItemId, "mouse");
        },
        true);

  /* 2. Listen for keyboard shortcuts and mouse command events on the
   * main command set: */
  let mainCommandSet = window.document.getElementById("mainCommandSet");
  this._listen(mainCommandSet, "command", function(evt) {
    let tag = evt.sourceEvent.target;
    if (tag.tagName == "menuitem") {
      let menuItemId = tag.id?tag.id:tag.command;
      let menuId = "unknown";
      let node = evt.sourceEvent.target;
      while(node) {
        if (node.tagName == "menupopup") {
          menuId = node.id;
          break;
        }
        node = node.parentNode;
      }
      record(menuId, menuItemId, "mouse");
    } else if (tag.tagName == "key") {
      record("menus", tag.command?tag.command:tag.id, "key shortcut");
    }},
    true);
  /* Intentionally omitted the code from the menu study that tracks
   * number of menus hunted through and time spent hunting */
   
};

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: function() {
    tabs.open("http://www.mozilla.org/");
  }
});



// get and grok experiements.

var get_experiments = function(source,callback) {
    console.log("I am getting the experiments from the webs or locally");
    // ajax?  read local?  make it easy!
};

var parse_experiments = function(json,callback) {
    console.log("I just parsed the experiments");
    return {};
    // presume this is where all guards / checks are happening?
};

var decide_arm = function(multiarm_config,callback) {
    // return a study?  should this roll into run_or_not?
};


// user facing widgets... display data, panels, doorhangers, etc.

var show_data = function(survey_id,callback) {
    console.log("get the data and show in a new tab ");
};

var list_studies = function(survey_list,callback){
    // to users!
};

var get_consent = function(){};

var upload_data = function(){};

// utilities?

var set_testpilot_prefs = function(){};

var record = function(data,bin,callback) {
    if (! bin) { bin = "UNKNOWN" };
    var now = new Date();
    console.log("put the string into the simple storage db, with the current ts as:");
    console.log("    " + now + ":" + data + ":" + bin);
    if (! simpleStorage.storage[RECORDNAME]){
        simpleStorage.storage[RECORDNAME] = [];     
    }
    simpleStorage.storage[RECORDNAME].push({ts:now + 0, bin:bin, data : data});
}

var install_extension = function(id_or_name_or_path,callback) {
    // this should use the extension installer, needs addon-sdk work.
    console.log("I installed an extension");
};

var log_observed = function (subject,data){
    console.log("OBSERVED",subject,data,"TOPIC:", this.topic)
    var bin = data['bin'] || "unknown";
    record(JSON.stringify(data,bin));
    };

/* all windows*/
var delegate = {
  onTrack: function (window) {
    console.log("Tracking a window: " + window.location);
    // Modify the window!
  },
  onUntrack: function (window) {
    console.log("Untracking a window: " + window.location);
    // Undo your modifications!
  }
};
var tracker = new windowUtils.WindowTracker(delegate);

/*
// this is a bit redundant...  
var windowUtils = new windowUtils.WindowTracker({
  onTrack: function (window) {
    console.log("new window tracked, should cram experiements in there");
    if ("chrome://browser/content/browser.xul" != window.location) return;
    var forward = window.document.getElementById('forward-button');
    var parent = window.document.getElementById('unified-back-forward-button');
    parent.removeChild(forward);
  }
});
*/

/* under this system, it's easy to force checks / redownloads, 
    using an ObserverMessage...
    
    basically have hourly hygeine to check when experiments should 
    end / start, etc.
*/
/*
var ts_last_check = 0;
var TIMEBETWEENUPDATES = 86400;
var check_interval = 600;
var intervalid = timers.setInterval(function() {
   //if (some_condiditon) { timers.clearInterval(intervalid); }
   var now = new Date();
   if (now - ts_last_check >= TIMEBETWEENUPDATES) {
   var topic = "tp_record_me";
   var subject = {when:now, what:'some thing'};
   console.log("about to notify", topic, JSON.stringify(subject));
   observer.notify(topic,subject);
  
}, check_interval);
*/


// actually run the experiments

var do_survey = function(survey,callback) {
    console.log("would do a notification here");
    notifications.notify({
      title: survey.name,
      text: survey.summary,
      data: "we clicked on a survey",
      onClick: function (data) {
        console.log(data);
        // console.log(this.data) would produce the same result.
      }
    });
};

var do_experiment = function(experiment,callback) {
    console.log("should I do the experiment?");
    console.log("--> I should, so I will");
    // install any addons, tracking them?
    // get and do all handlers from the addon?
    // load and run handlers from the 'external' experiment code?
     
};


// main, which pulls it all together!

var main = function(callback) {
    console.log("testpilot main.js:main running.");
    observer.add("tp_record_me",log_observed);
    //observer.add("tp_experiment_done",end_experiment);
    //observer.add("tp_experiment_start",end_experiment);
    //observer.add("tp_experiment_update",update_experiment);

    get_experiments();
    parse_experiments();
    for (let i in [1,2,3,4]) {
        let s = {name: "survey " + i, summary: "summary " + i};
        do_survey(s,function(){true});
    };
    record(JSON.stringify({event:'clicked',element:"id1"}), 'mybin1');
    //sample_experiment_code();
};



// main();

exports.main = main;

/*

12:01 < gregglind> I am open to ideas :)  Suppose I had to jetpack addons running... how can they talk to each other?
12:01 < gregglind> what is the most sensible message bus?
12:02 < gregglind> (real use case:  test pilot is A.  installs addon B.  it would be nice if B could take care of 
                   sending it's own messages about what to record)
12:02 < Mossop> The observer services is pretty much built for broadcasting messages to anyone that wants to listen
12:03 < gregglind> Mossop, I feel foolish now :)
12:03 < gregglind> and it's already wrapped!

12:05 < Mossop> Probably wouldn't be too difficult to make eventemitter instances that use that to broadcast events to 
                all too. You can JSON a object to pass through the observer service easily
12:05  * KWierso glares at random test timeouts while testing the test builds up on the staging server...
12:06 < gregglind> thank Mossop.  I am still in the design stage here for TP2
12:06 < gregglind> I think as part of that, I will be building a 'install / uninstall addons' bit that can go in jetpack

Addons can talk back to TP via observer....


const { EventTarget } = require('api-utils/event/target');
let target = EventTarget.new();
target.on('tprecord', function onMessage(message) {
  // Note: `this` pseudo variable is an event `target` unless
  // intentionally overridden via `.bind()`.
  // do we want to jsonify, unless it's a string already?
  console.log(message);
  // really this should be to simplestore...
});


*/
