let {has} = require('array');
const { Class, mix } = require('api-utils/heritage');
const { emit, on, once, off } = require('api-utils/event/core');
const { EventTarget } = require('api-utils/event/target');
const myprefs = require("simple-prefs").prefs;
const Request = require("request").Request;
const timers = require("timers");

const {codeok} = require('tputils');
const {Study,survey_defaults,experiment_defaults,revive} = require("study");
const {STATUS} = require("status");

/* an experiment in prefs:

json has studyspecs.

TODO:  what is something goes out of sync?

  testpilot2.study.<studyid>
    * attempts:  int
    * nextattempt:  float
    * starttime:  float
    * stoptime:  float
    * status: int
    * arm:  int?
    * installed_addons: [{url:, summary:?}]
    * binary: url/to/update.xml
    * return_binary: url/to/update.xml

  testpilot2.randomizer.<branchid>
    * value:  float

  testpilot2.
    * version
    * studyjson_url:
    * studyjson_interval:
    * upload_interval
    * upload_url:  url that takes posts
    * studyjson_ts:  ts of last experimental grab
    * helpurl: url_or_path (just in case!)
    * show_debug:  false
*/


/*
This could be some sort of evented thingy.  For now, it's just an plain obj
the study tracker
*/

// TODO, how ambitious should this get?
let tpstudies = exports.tpstudies = {};


// how often tp tries to police itself, in ms.  other pieces are on slower schedules.
let tp_hygeine_pref = "hygeineinterval";
let tp_hygeine_interval = myprefs[tp_hygeine_interval] || 60*1000;

// TODO, make this change on pref change
let tp_heartbeat = timers.setInterval(function() {
    monitor();
},tp_hygeine_interval);

let Commander = Class({
	initialize: function(){
		// revive all studies from disk
		// run hygeine every x seconds
	},
	extends: EventTarget,
	start: function(){
		if (this._started) {
			revive_all_studies();
			this._started = true;
		}
		monitor();
	},
});

let commander = exports.commander = Commander();


var getJson = function(url,callback) {
    /* callback called with response.json

    TODO:  make this whole chain promise style.
    */
    console.log("getJson",url);
    // do some magic to decide. then if url:
    Request({
        url: url,
        onComplete: function (response) {
            //console.log(response.text, response.status);
            //console.log("response gotten", response.json);
            if (!codeok(response.status) ||  !response.json) {
                console.log("getJson bad status (",response.status,") OR no response.json");
                return false;  // break here, don't callback at all.
                // TODO, how to handle the ISSETTINGUP here?  should signal that.
            }
            for (var headerName in response.headers) {
              console.log(headerName + " : " + response.headers[headerName]);
            }
            if (callback !== undefined) callback(response.json);
            return true;
        }
    }).get();
};

var download_studies = function(url,callback) {
    /* callback calls with the json */
    console.log("I am downloading the experiments from url:",url);
    getJson(url,callback);
};


let revive_all_studies = exports.revive_all_studies = function(){
	// loop through the ones on disk, start them up.
	// TODO, how often should this happen?
	for (let pref in myprefs){
		console.log(pref);
	};
};


// TODO MAKE THIS ROBUST!  Sensible constructors?
// TODO, this is doing too much.
var parse_studies = function(json,callback) {
    /* callback calls with the experiments list */
    console.log("Checking experiments for validity");
    console.log("I just parsed the experiments");
    // do some parsing in here...
    // presume this is where all guards / checks are happening?
    var studies = json;
    //  TODO... handle study arms.

    // TODO here is my grody constructor... maybe we should refactor this?
    let create_update_revive = function(s,defaults) {
        let id = s['id'];
        let revived = false;
        // TODO test this
        if (s.kill) {
            if (tpstudies[id]) { tpstudies[id].uninstall() }
            delete tpstudies[id];
            return true;
            // TODO, what should happen to study status?   what traces are left of the study?
        }
        let cur = tpstudies[id];

        // TODO, what to update here, if anything, given conflicts, differences.
        if (cur) {
            console.log("EXISTS: not overriding!",cur);
            console.log("-- :",Object.keys(cur), cur.toString());
            //cur.config = mix(cur.config,s);
            return true;
        } else {
            // does it exist on disk?
            let revivedstudy = revive(id);
            if (revivedstudy) {
                revived = true;
                console.log("reviving study:", id, "as: \n   ", JSON.stringify(revivedstudy));
                s = revivedstudy;
            }
            // TODO: check if any keys conflict.  If so, who wins?
            console.log(JSON.stringify(mix(defaults,s)));
            cur = Study(mix(defaults,s));
            tpstudies[id] = cur;
            console.log("-- :",typeof(cur), Object.keys(cur), cur.toString());
        };
        cur.persist();
        let S = STATUS;

        // TODO, is this the right place to handle this?  tangled, again!
        // TODO, this is needs some work for other status on when to 'hard set'
        // TODO, this is the same problem as the nag problem, fwiw.
        if (cur.config.status === undefined) {
            cur.setStatus(STATUS.NEW);  // this is pretty safe!
        } else {
            // retry these ones, meant for first run after fx restart, for example
            if (revived && has([S.ASKINSTALL,S.COLLECTING,S.ASKUPLOAD],cur.config.status)){
                console.log("re-setting to same status!");
                cur.setStatus(cur.config.status);
            };
        }
        return true;
    };

    studies.forEach(function(s){
        switch (s.studytype) {
            case "experiment":
                create_update_revive(s,experiment_defaults);
                break;
            case "simplesurvey":
                create_update_revive(s,survey_defaults)
                break;
            default:
                console.error("unknown study type:", JSON.stringify(s));
                break;
        };
    });

    myprefs['indextimestamp'] = '' + Date.now();
    if (callback) callback(studies);  // TODO, what should this callback with?
};


var decide_arm = function(multiarm_config,callback) {
    // return a study?  should this roll into run_or_not?
    // get user info here?
    // see which 'arm' matches first...
    // some default 'rules' here?
};



// START AND RUN EXPERIMENTS

/* does all the callback chains correctly.  Safe to re-run

    Superfunction.
*/
let ISSETTINGUP = false;
let monitor = function(url) {
    // TODO, should this be checked that it's not "in the middle of running?"
    console.log("AGAIN IN THE SETUP AND RUN!");
    if (ISSETTINGUP) {
        console.log("already setting up!");
        return
    };
    ISSETTINGUP = true;
    // is it time to try to redownload studies?
    // if so, do so and update the experiments list
    //    setting status on all of them, along the way.
    // for each study, is it time to do anything on them, based on status?
    url = url || myprefs['indexurl'];
    if (!url) {console.log('setup and run: no url given'); return;}

    console.log("setup and run:",url, "next:", JSON.parse(myprefs['indexnextdownload'] || 0 ));
    if (Date.now() > (JSON.parse(myprefs['indexnextdownload'] || 0))) {
        download_studies(url,
            // callback on the json
            function (json) {
                parse_studies(json,
                    function(experiments) {
                        let now = Date.now();
                        myprefs['indextimestamp'] = JSON.stringify(now);
                        myprefs['indexnextdownload'] = JSON.stringify(now + JSON.parse(myprefs['indexinterval']) * 1000);
                        ISSETTINGUP = false;  // TODO waiting this long to unlock could bork until next restart
                    })
            }
        );
    }
};
