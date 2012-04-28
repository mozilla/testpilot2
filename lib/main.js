/* 

this code is MPL licenced, for now.

Author:  Gregg Lind
*/

/* TODOS::

* private browsing
* what if tp is turned off?  Should it remove the extensions it installed?  Confirm with the user?
* how to detect the end of experiements?  Make this robust to time zone changes, etc?
* install_extensions needs robusting / refactoring.

(and of course, finish, debug, and test the code!)


Other ideas:

use as much as possible of the 'package.json' from npm / addons as possible in experiments?


*/


"use strict";

const data = require('self').data;
//https://developer.mozilla.org/en/XUL/notificationbox
const notifications = require("notifications");
const observer = require("observer-service");
const packaging = require("@packaging");
const prefs = require("simple-prefs");
const Request = require("request").Request;
const self = require("self");
const simpleStorage = require('simple-storage');
const tabs = require("tabs");
const timers = require("timers");
const widgets = require("widget");
const windowUtils = require("window-utils");
const AddonManager = require("AddonManager").AddonManager;

console.log("testpilot main.js running.");
console.log(self.id,self.uri,self.name,self.version);
console.log(packaging.uriPrefix, packaging.jetpackID);

var RECORDNAME = "testpilot2";
if (!simpleStorage.storage[RECORDNAME])
  simpleStorage.storage[RECORDNAME] = [];


// this is the state of everything.  Should these be collections?
var installed_extensions = [];
var running_experiments = [];
var failed_experiemnts = [];


// get and grok experiements.

var get_experiments = function(url,callback) {
    /* callback calls with the json */
    console.log("I am getting the experiments from url",url);
    getJson(url,callback);
};

var parse_experiments = function(json,callback) {
    /* callback calls with the experiments list */
    console.log("Checking experiments for validity");
    console.log("I just parsed the experiments");
    // do some parsing in here... 
    // presume this is where all guards / checks are happening?
    var experiments = json;
    if (callback) callback(experiments);
};

var run_experiments = function(experiments,callback) {
    // should this be blocking or async?
    // right now, it blocks.
    var E = experiments;
    let surveys = experiments['simplesurveys'] || [];
    surveys.forEach(function(s) do_survey(s));
    let ee = experiments['experiments'] || [];
    ee.forEach(function(s) do_experiment(s));

    if (callback) callback(true);
}

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

var get_consent = function(content,callback){};

var upload_data = function(){};

var testpilot_status = function(){
};


// utilities?

var urlize = function(filename) {
    /* this is toally weak-tea and unreliable...! ":" in string! */
    if (/:/.test(filename)) { return filename }
    else return data.url(filename) 
};

var getJson = function(url,callback) {
    /* callback called with response.json
    */
    console.log("getJson",url);
    // do some magic to decide. then if url:
    Request({
        url: url,
        onComplete: function (response) {
            for (var headerName in response.headers) {
              console.log(headerName + " : " + response.headers[headerName]);
            }
            console.log(response.text, response.status);
            console.log("response gotten", response.json);
            // TODO get the errors here done right.
            if (callback) callback(response.json);
        }
    }).get();
};

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
    console.log("trying to install extension:", id_or_name_or_path);
    AddonManager.getInstallForURL(
        id_or_name_or_path,
        function(aInstall) {  
          // aInstall is an instance of {{AMInterface("AddonInstall")}}  
          aInstall.install();  
          console.log("installed!");
          installed_extensions.append(id_or_name_or_path);
        }, "application/x-xpinstall"); 
    };

var log_observed = function (subject,data){
    console.log("TestPilot sees:",subject,data,"TOPIC:", this.topic)
    var bin = "unknown";
    if (data) bin = data['bin'];
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


// this is one way of setting up an experiement... is it right?

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
    console.log("#### DOING A SIMPLE SURVEY ####");
    console.log("(would show window, where user clicks on url)");
    ['name','summary','url','phonehome'].forEach(function(k) {
        let v = survey[k];
        console.log("    ",k,":", v);
    });
    
    /*
    notifications.notify({
      title: survey.name,
      text: survey.summary,
      data: "we clicked on a survey",
      onClick: function (data) {
        console.log(data);
        // console.log(this.data) would produce the same result.
      }
    });*/
};

var do_experiment = function(experiment,callback) {
    console.log("should I do the experiment?");
    console.log("--> I should, so I will");
    
    var will_run = true;
    // check the time, run or not etc.
    if (!will_run)  callback(false) ;  // or something!
    
    // set observer listeners first
    (experiment['observe'] || []).forEach(
        function (obs) {
            console.log("tp adding observer for:", obs);
            observer.add(obs,log_observed);
    });

    // install any addons, tracking them?
    var addons = experiment['addons'] || [];
    addons.forEach(function(aUrl) {
        install_extension(urlize(aUrl));
    });
    
    // set timers for when to push this data
    
    // set timers for when to stop it
    running_experiments.push(experiment);
    
    if (callback) callback(experiment);     
};

// 'window' here is a proxy for lots of other stuff
// that an experiment can have starting up... 
// TODO, are we reinventing 'require' here?  
var start_experiment = function(id,fn,window,callback){
    let experiement_tracker = new windowUtils.WindowTracker({
        onTrack: function (window) {
            console.log("new window tracked, should cram experiements in there");
            fn(window)
        }
    });
};


/* does all the callback chains correctly.  Safe to re-run 
    callback gets ??  
    
    Superfunction.
*/
var get_and_run_experiments = function(url,callback) {
    get_experiments(url,
        function (json) {
            parse_experiments(json, 
                function(experiments) {
                    run_experiments(experiments);
                })
        }
    );
};


// main, which pulls it all together!    
var main = function(options,callback) {
    console.log("testpilot main.js:main running.");
    observer.add("tprecord",log_observed);
    //observer.add("tp_experiment_done",end_experiment);
    //observer.add("tp_experiment_start",end_experiment);
    //observer.add("tp_experiment_update",update_experiment);
    get_and_run_experiments(data.url("example/example.json"));
    
    /*
    for (let i in [1,2,3,4]) {
        let s = {name: "survey " + i, summary: "summary " + i};
        do_survey(s,function(){true});
    };
    record(JSON.stringify({event:'clicked',element:"id1"}), 'mybin1');
    */
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


16:54 < KWierso> gregglind_away: maybe gozala's repl library? https://github.com/Gozala/jep4repl

*/




