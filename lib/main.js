/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* TODOS::

* what if tp is turned off?  Should it remove the extensions it installed?  Confirm with the user?
* how to detect the end of experiments?  Make this robust to time zone changes, etc?
* install_extensions needs robusting / refactoring.

12:02 < Mossop> The observer services is pretty much built for broadcasting messages to anyone that wants to listen
12:05 < Mossop> Probably wouldn't be too difficult to make eventemitter instances that use that to broadcast events to
                all too. You can JSON a object to pass through the observer service easily
12:05  * KWierso glares at random test timeouts while testing the test builds up on the staging server...
16:54 < KWierso> gregglind_away: maybe gozala's repl library? https://github.com/Gozala/jep4repl

*/

"use strict";

const { activateTab, closeTab, isTabOpen, openTab } = require('api-utils/tabs/utils');
const { Branch } = require("api-utils/preferences-service");
const { Class, mix } = require('api-utils/heritage');
const { Collection } = require("collection");
const data = require('self').data;
const { emit, on, once, off } = require('api-utils/event/core');
const { EventTarget } = require('api-utils/event/target');
const globals = require('api-utils/globals');
const { Hotkey } = require('hotkeys');
const addoninstaller = require("addon/installer");
const myprefs = require("simple-prefs").prefs;
const observer = require("observer-service");
const {PageMod} = require("page-mod");
const pb = require("private-browsing");
const prefs = require("simple-prefs");
const preferencesservice = require("preferences-service");
const Request = require("request").Request;
const self = require("self");
const tabs = require("tabs");
const timers = require("timers");
const widgets = require("widget");
const windowUtils = require("window-utils");
const window = windowUtils.activeBrowserWindow;

const {AddonManager} = require("AddonManager");
const {EventSelector} = require("selectedevents");
const {switchtab,banner,doorhanger,nbButtons:B,anchorit} = require("moz-ui");
// TODO: yes, it's gross that this requires a 'new'.
const tpstore = new require("tpstore").tpstore;

console.log("testpilot main.js running.");
console.log("id,uri,version:", self.id,self.uri,self.version,self.data.url(""));

// TODO... is this gross as a global?
// TODO, make it aware of when a change happens to it!  Decide what to do in that case.
const tpstudies = {};
const installed_extensions = {};

let tpaddonsandbox = this;

// this is gross to have in here, but it isn't exposed otherwise from simple-prefs
const ADDON_BRANCH = "extensions." + self.id + ".";

// in seconds  TODO, pref (for testing)?
var nags = [0,60*5,60*60,60*60*24];

var DEFAULT_DURATION = 86400;

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


// complete <- uploaded <- askupload <- done <- install <- askinstall <- NEW
var STATUS= {
    NEW: "NEW",
    ASKINSTALL:  "ASKINSTALL",
    INSTALL:  "INSTALL",
    COLLECTING:  "COLLECTING",
    ASKUPLOAD: "ASKUPLOAD",
    UPLOAD:  "UPLOAD",
    COMPLETE:  "COMPLETE",
    ERROR:  "ERROR",
    REFUSED:  "REFUSED",
    IGNORED:  "IGNORED",
    ABANDONED:  "ABANDONED"
};

// returns null OR object with keys from disk (prefs)
var revive = function(id,startbranch){
    startbranch = startbranch || ADDON_BRANCH;
    let diskkey = 'config.' + id + '.';
    let out = preferencesservice.get(startbranch + diskkey);
    if (out) {
        out = JSON.parse(out);
    } else {
        out = null;
    }
    return out;
};

var Study = Class({
  initialize: function initialize(config) {
    console.log(JSON.stringify(config));
    this.config = config;
    this.activetimers = new Collection();  //
    this.activeui = new Collection();
    this.activedownloads = new Collection();
    // TODO, should this be traits?
    if (! this.config.id ) { throw new Error("study needs an id")};
  },
  extends:  EventTarget,
  type: 'Study',

  get studytype(){ return this.config.studytype },

  persist: function() {
    // TODO, should we just dump this into one key?  might be simpler.
    let config = this.config;
    var id = config.id;
    myprefs['config.' + id] = JSON.stringify(config);
  },

  setStatus: function(status){
    let S = STATUS;
    console.log("STATUS:", this.config.id, this.config.status, '->', status);
    this.statuscleanup();
    this.config.status = status;
    switch (status) {
      case S.NEW:
        this.uninstall();
        this.setStatus(S.ASKINSTALL);
        break;
      case S.ASKINSTALL:  this.askinstall(); break;
      case S.INSTALL:  this.install(); break;
      case S.COLLECTING:  this.collect(); break;
      case S.ASKUPLOAD: this.askupload(); break;
      case S.UPLOAD:  this.upload(); break;
      case S.COMPLETE:  this.uninstall(); break;
      case S.ERROR:   this.uninstall(); break;
      case S.REFUSED: this.uninstall(); break;
      case S.IGNORED:  this.uninstall(); break;
      case S.ABANDONED:  this.uninstall(); break;
      default:
        console.error("ERROR:  what is this status?", status);
    };
  },

  // TODO, figure out which of these need to run when.
  statuscleanup:  function(){
    this.clearui();
    this.canceldownloads();
    this.cleartimers();
    this.clearpagemods();
    //this.clearobservers();
  },

  clearobservers: function(){
    for (let x in this.installed_observers) {
        console.log('killing observer',x.topic,Object.keys(x));
        observer.remove(x.topic,x.obs);
    };
    return true;
  },

  askinstall: function(){
    console.log("askInstall");
    let my = this.config;
    if (my.install === undefined) my.askinstall = {};
    let attempts = Number(my.askinstall.asks) || 0;
    let nextattempt = Number(my.askinstall.nextask) || 0;
    console.log('asking to run:', my.id,  'attempt:', attempts);

    let listeners = [];
    listeners.push( this.on("status", function(message){
        console.log("FROM TPBOX", message);
        if (message == "ACCEPTED") {
            my.flags[F] = true;
            success !== undefined && success() };
    }));

    if (my.studytype == "simplesurvey") {
        var askbanner = ask_survey(this); // setStatus inside there.
        this.activeui.add(askbanner);
    } else {
        var askbanner = ask_experiment_install(this); // this is tangled
        this.activeui.add(askbanner);
    }
  },

  install:  function(){
    console.log("installing");
    // Ready to rock! installed everything here!
    this.once("installed",function() {
        console.log("installed");
        this.setStatus(STATUS.COLLECTING);
    });
    this.start_experiment();  //my.duration, addons, etc.
  },

  collect:  function(){
    let study = this;
    let my = this.config;
    console.log("collecting");

    this.once("donecollecting",function() {
        this.clearobservers();
        this.clearpagemods();  // kill the pagemods.
        this.setStatus(STATUS.ASKUPLOAD);
    });

    let duration =  (Number(my.duration) || DEFAULT_DURATION);
    my.donetime= 1000 * duration + Date.now();
    console.log(duration, "killing at", my.donetime, Date.now() );
    var donetimer = timers.setInterval(function(){
        if (Date.now() > my.donetime) {
            console.log(Date.now());
            emit(study,'donecollecting');
            timers.clearInterval(donetimer); // cleanup
        }
    }, my.donetime-Date.now());
    this.activetimers.add(donetimer);
  },

  askupload: function(){
    console.log("askupload");
    let listeners = [];
    listeners.push( this.once("status", function(message){
        console.log("FROM TPBOX", message);
        if (message == "ACCEPTED") {
            this.setStatus(STATUS.UPLOAD);
        };
    }));

    // handle "always upload"
    if (myprefs['uploadwithoutprompting']){
        console.log("uploadwithoutprompting");
        emit(this,"status", {message: "ACCEPTED"})
    } else {
        var askbanner = ask_experiment_upload(this); // this signals status back
        this.activeui.add(askbanner);
    }
  },

  upload: function(){
    console.log("upload");
    let my = this.config;
    let thestudy = this;
    // TODO... handle "didn't complete successfully" case
    // TODO, what should the 'retry' schedule on this be?
    let url = myprefs['uploadurl'] + my.id;
    let dataString = '';
    tpstore.retrieveStudyData(my.id,function(userData){
        dataString = JSON.stringify(userData);
        console.log("DATA FOR STUDY:  ", studyid, "is:");
        console.log(JSON.stringify(userData));
    });
    console.log("WILL UPLOAD\n", dataString);
    // TODO multiple retry.
    Request({
        url:  url,
        onComplete: function(response) {
            var s = response.status;
            console.log("POST to ",url,"got this back:", s)
            if (codeok(s)) {
                thestudy.setStatus(STATUS.COMPLETE);
            } else {
                console.log("upload failed.  TODO, try again later.");
                callback(false);  // TODO, set retry
            }
        },
        content:  dataString,
        contentType:  "application/json",
        contentLength: dataString.length
    }).post();

    this.setStatus(STATUS.COMPLETE);
  },

  uninstall:  function uninstall(success){
    let my = this.config;
    this.statuscleanup();
    let id = my.id;

    // uninstall extensions, only if no-one else is using them  TODO
    if (installed_extensions[id]) {
        console.log("we have extensions");
        for (let extid in installed_extensions[id]) {
            console.log("removing addon TODO");
            tpbanner({msg:"disabling:" + extid});
            addoninstaller.disable(extid);
        };
        delete installed_extensions[my.id];
    };
    // uninstall observers, should any remain.
    this.clearobservers();
  },

  clearui: function(){
    console.log('softkilling any banners');
    console.log('softkilling any panels');
    for (let x in this.activeui) {
        console.log('  (killing)',x);
        emit(x,"softkill"); // tpbanner hears this.
    };
    this.activeui = new Collection();
  },

  canceldownloads: function(){
    console.log('(would) cancel downloads');
  },

  cleartimers: function(){
    console.log('clearing timers');
    for (let x in this.activetimers) {
      // clear both, just in case!
      timers.clearTimeout(x);
      timers.clearInterval(x);
    };
    this.activetimers = new Collection();
  },

  clearpagemods: function(){
    delete this.pagemods;
    // TODO, check that this doesn't leak the pagemods.  else 'clean them up right'
  },

  start_experiment: function() {
    /*  UI and monitoring experiments.

    install plugins.
    change binary. // TODO
    install listeners.
    pagemods (for simple experiments)
    add duration / timeout.
    set status to running.
    */

    // TODO, handle errors with failure here.


    let my = this.config;
    let id = my.id;

    // add the observer for eventselectors, just in case
    let eventselectors_obs_chan = "testpilot-"+ my.id ;
    if (my.observe === undefined) { my.observe = []};

    if (my.observe.indexOf(eventselectors_obs_chan) == -1) {
        my.observe.push(eventselectors_obs_chan);
    }

    // set observer listeners first.
    if (this.installed_observers === undefined ) {this.installed_observers = new Collection()};
    let obscoll = this.installed_observers;
    console.log("will want to observe:", my['observe'] || []);
    (my['observe'] || []).forEach(
        function (topic) {
            console.log("tp adding observer for:", topic,id);
            let cb = function(subject) {watch(subject,id)};
            let o = observer.add(topic,cb);
            obscoll.add({topic:topic,obs:cb});
            console.log("result of add:", o,cb)
            // TODO fix the observer-server.js, which lies here!
            //    add returns *nothing*
    });

    // install any addons, tracking them?
    var addons = my['addons'] || [];
    if (installed_extensions[id] === undefined || !installed_extensions[id].length) {
        installed_extensions[id] = new Collection();
    };
    var extcoll = installed_extensions[id];
    addons.forEach(function(obj) {
        let {url} = obj;
        console.log("start exp:  ", url);
        addoninstaller.installUrl(urlize(url)).then(
            function(aAddon) {extcoll.add(extid)}
        );
    });

    console.log('starting pagemod, if needed.');
    if (my.eventselectors) {
        console.log(JSON.stringify(my.eventselectors));
        this.pagemods = [ EventSelector(x,eventselectors_obs_chan) for each (x in my.eventselectors) ];
    }

    my.donetime= 1000 * (Number(my.duration) || DEFAULT_DURATION) + Date.now();
    emit(this,"installed");
  },

}); // end of Study class


var survey_defaults = {
    image: data.url("img/home_comments.png"),
    info:  'https://testpilot.mozillalabs.com/',
    phonehome: '',
    studytype: 'simplesurvey',
};

var experiment_defaults = {
    image: data.url("img/testPilot_200x200.png"),
    info:  'https://testpilot.mozillalabs.com/',
    phonehome: '',
    studytype: 'experiment',
};

var download_studies = function(url,callback) {
    /* callback calls with the json */
    console.log("I am downloading the experiments from url:",url);
    getJson(url,callback);
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

    // here is my grody constructor...
    var create_or_update = function(s,defaults) {
        let id = s['id'];
        // TODO, allow explicit "kill" order.  studies need a .kill() method.
        if (s.kill) {
            if (tpstudies[id]) { tpstudies[id].die() }
            delete tpstudies[id];
        }
        let cur = tpstudies[id];

        // just update with the *explicit* ones.
        if (cur) {
            console.log("EXISTS: not overriding!",cur);
            console.log("-- :",Object.keys(cur), cur.toString());
            //cur.config = mix(cur.config,s);
            return;
        } else {
            // does it exist on disk?
            let revivedstudy = revive(id);
            if (revivedstudy) {
                console.log("reviving study:", id, "as: \n   ", JSON.stringify(revivedstudy));
                s = revivedstudy;
            }
            // TODO: check if any keys conflict....
            console.log(JSON.stringify(mix(defaults,s)));
            cur = Study(mix(defaults,s));
            tpstudies[id] = cur;
            console.log("-- :",typeof(cur), Object.keys(cur), cur.toString());
        };
        cur.persist();
        cur.setStatus(STATUS.NEW);
    }

    let surveys = studies['simplesurveys'] || [];
    surveys.forEach(function(s) {
        create_or_update(s,survey_defaults)
    });

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

    myprefs['studies_timestamp'] = '' + Date.now();
    if (callback) callback(experiments);
};


var decide_arm = function(multiarm_config,callback) {
    // return a study?  should this roll into run_or_not?
    // get user info here?
    // see which 'arm' matches first...
    // some default 'rules' here?
};



// user facing widgets... display data, panels, doorhangers, etc.

var tpbanner = function(options){
    // {msg,id,icon,priority,buttons,callback,nb} = options;
    let stdoptions = {
       icon: data.url("img/testpilot_16x16.png"),
       priority: 3
    };
    options = mix(stdoptions,options);
    return banner(options);
};

/* try ours, then fallback of anchorit.  Should  */
var hangspot = function(ids){
    if (! ids) { ids = ['feedback-menu-button']; }
    return anchorit(ids) || anchorit();
};

// TODO, turn this into a promise...
var ask_experiment_install = function(study){
    var decided = false;
    var tpb = tpbanner({
        msg: "new study:  " + (study.config.headline || study.config.id),
        buttons: [
        B['more info']({
            callback:  function(nb,b) {console.log("wanted: more info!")
                more_info(study);
                return true // keep the bar
            }
        }),
        B.no({callback:  function() { decided=true; study.setStatus(STATUS.REFUSED)}}),
        B.yes({callback:  function() { decided=true;
            console.log('calling back yes'); study.setStatus(STATUS.INSTALL)}})]
    })

    // remember, we added AlertClose.
    tpb.once("AlertKilled", function(){
        decided=true;   // This is a true 'miss'
    });
    tpb.on("AlertClose",
        function () {
            console.log("banner closing. decided?", decided );
            (!decided) && study.setStatus(STATUS.REFUSED)}
    );
    return tpb;
};

var ask_experiment_upload = function(study){
    var decided= false;
    var tpb = tpbanner({
        msg: "ready to upload:  " + (study.config.headline || study.config.id),
        buttons: [
        B['show collected data']({
            callback:  function(nb,b) {
                console.log("[ see data ] for", study.config.id);
                show_data(study);
                return true; // keep bar around.
            }
        }),
        B['always']({
            callback: function() {decided=true;
                study.setStatus(STATUS.UPLOAD);
                myprefs['uploadwithoutprompting'] = true;
            }
        }),

        B.no({callback:  function() { decided=true; study.setStatus(STATUS.REFUSED)}}),
        B.yes({callback:  function() { decided=true; study.setStatus(STATUS.UPLOAD)}})]
    });
    return tpb;
};


// actually run the experiments
var finish_survey = function(survey){
    survey.setStatus(STATUS.COMPLETE);
    survey.persist();
    switchtab(survey.config.url);
};


var ask_survey = function(survey) {
    /*   Asking about the survey and doing it are pretty much the same thing here
    */
    console.log("#### DOING A SIMPLE SURVEY ####");
    var decided = false;
    if (survey.config.phonehome) {
        Request({ url: survey.config.phonehome}).get();  // we just make the effort!
    }
    // TODO, what if this is 2nd time we offered it?  should we record that we phones home?

    var tpb = tpbanner({
        msg: "new survey:  " + survey.config.headline || (survey.config.summary.slice(0,80)+"..."),
        buttons: [
            B['take survey']({
                callback: function(nb,b){
                    decided=true;
                    finish_survey(survey);  // We can call that from other pages.
                }
            }),
            B['more info']({
                callback:  function(nb,b) {
                    console.log("wanted: more info!");
                    more_info(survey);
                    return true;
                }
            }),
            B.no({callback:  function() {decided=true; survey.setStatus(STATUS.REFUSED)}})
        ]
    });

    tpb.once("AlertKilled", function(){
        decided=true;   // This is a true 'miss'
    });

    tpb.on("AlertClose",
        function () {
            console.log("banner closing. decided?", decided );
            (!decided) && survey.setStatus(STATUS.REFUSED)}
    );
    return tpb;
    // PANELS / DOORHANGERS are *TERRIBLE*:  ephemeral, no jquery events (only xul)!
};



// ADMIN and DISPLAY PAGES

/*  set up a domain with all the scripts loaded.

    going this way (rather than via tab) allows:

    1.  any url hit in there will 'do the right thing'

    caveats:

    1.  if the addon is off, the js won't pre-inject, and those pages are
        on their own!  maybe in them, have a standard element
        "this page requires TestPilot to be on to work right"

    https://builder.addons.mozilla.org/addon/1051088/latest/



tabs.on('ready', function(tab) {
    if (! tab.url matches ) return;
    var my_js = baseid(url)... +js + js/...


    console.log("fired ready");
    tab.attach({
        contentScriptFile: data.url('test.js')
    })
});

*/


var uipages = PageMod({
  include: self.data.url("") + "*",
  contentScriptFile: [data.url('js/jquery.min.js'),
                    data.url('js/ICanHaz.min.js'),
                    data.url('js/underscore_min.js'),
                    data.url('js/contentscript.js')],
  onAttach: function onAttach(worker) {
    worker.port.emit("attached",'message from page mod');
    console.log("UIPAGES:",worker.url);
    worker.port.on('selfmessage',function(payload){
        console.log("PAGEMOD:",payload);
    });
    worker.port.emit("populatestudies",tpstudies);
    observer.add("testpilot",function(subject,data){
        subject.message == "setstatus" && worker.port.emit("populatestudies",tpstudies);
    });

  }
});


var showdatapage = PageMod({
  include: self.data.url("showdata.html") + "*",
  contentScriptFile: [data.url('js/jquery.min.js'),
                    data.url('js/ICanHaz.min.js'),
                    data.url('js/underscore_min.js'),
                    data.url('js/showdata.js')],
  onAttach: function onAttach(worker) {
    worker.port.emit("attached",'message from page mod');
    console.log("SHOWDATAPAGE:",worker.url);
    worker.port.on('getdata',function(payload){
        let id = payload.id;
        let data = {'fake':'data'};
        worker.port.emit("gotdata",id,data);
    });
  }
});



var show_data = function(studyid,callback) {
    console.log("get the data and show in a new tab ");
    tpstore.retrieveStudyData(studyid,function(userData){
        console.log("DATA FOR STUDY:  ", studyid, "is:");
        console.log(JSON.stringify(userData));
    });
    switchtab(data.url("showdata.html") + "#" + studyid);
    // maybe on that page, it requests the data from the addon?  it can emit.
};

var list_studies = function(studies){
    // to users!
    let uri = data.url('index.html');
    let tab = switchtab(uri);
};


// TODO, fragments aren't there at first, so this doesn't 'home in' right.
var more_info = function(study){
    let studyid = study.config.id;
    let uri = data.url('index.html#study-' + studyid);
    let tab = switchtab(uri);
};


// utilities?

var codeok = function(s, codes) {
    if (codes === undefined) { codes = [0,200,201,202]; }
    return codes.some(function(e) { return (e == s) } );
};


var In = function(thing,array) { return array.indexOf(thing) >= 0 };

var urlize = function(fileid) {
    /* this is toally weak-tea and unreliable...! ":" in string! */
    if (/:/.test(fileid)) { return fileid }
    else return data.url(fileid)
};

var getJson = function(url,callback) {
    /* callback called with response.json
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
                //return false;
            }
            for (var headerName in response.headers) {
              console.log(headerName + " : " + response.headers[headerName]);
            }
            if (callback) callback(response.json);
        }
    }).get();
};


var install_extension = function(id_or_path,success,failure,hash) {
    // this should use the extension installer, needs addon-sdk work.
    console.log("trying to install extension:" + id_or_path + '"');
    AddonManager.getInstallForURL(
        id_or_path,
        function(aInstall) {
          console.log("started install!", id_or_path);
          // aInstall is an instance of {{AMInterface("AddonInstall")}}
          aInstall.install();
          // TODO right now, we are just assuming this all goes just fine!
          //success(aInstall);  // e.g., append it somewhere?
        }, "application/x-xpinstall"
    );
};


/*  callback will run on the completion of the record, for now */
var record = function(data,bin,callback) {
    if (! bin) { bin = "UNKNOWN" };
    var now = Date.now();
    console.log("put the string into the record storage db, with the current ts as:");
    console.log("    " + now + ":" + data + ":" + bin);

    // TODO, performance.
    if (pb.isActive) {
        console.log("not storing.  privacy");
    } else {
        console.log("  record, no private browse, to tpstore.");
        tpstore.record(data,bin,now,callback)
    }
};

var watch = function (subject,bin){
    console.log("TestPilot sees:",subject,"bin:",bin);
    bin = bin || "unknown";
    //if (data) bin = data['bin'];
    record(JSON.stringify(subject),bin);
};


// START AND RUN EXPERIMENTS

/* does all the callback chains correctly.  Safe to re-run

    Superfunction.
*/
var setup_and_run = function(url) {
    // is it time to try to redownload studies?
    // if so, do so and update the experiments list
    //    setting status on all of them, along the way.
    // for each study, is it time to do anything on them, based on status?
    url = url || myprefs['indexurl'];
    if (!url) {console.log('setup and run: no url given'); return;}

    console.log("setup and run:",url, "next:", JSON.parse(myprefs['indexnextdownload']) || 0 );
    if (Date.now() > (JSON.parse(myprefs['indexnextdownload']) || 0)) {
        download_studies(url,
            function (json) {
                parse_studies(json,
                    function(experiments) {
                        let now = Date.now();
                        myprefs['indextimestamp'] = JSON.stringify(now);
                        myprefs['indexnextdownload'] = JSON.stringify(now + JSON.parse(myprefs['indexinterval']) * 1000);
                    })
            }
        );
    }
};

var setprefs = function (prefs,prefix) {
    if (! prefs) {return};
    prefix === undefined ? prefix = "+" : true;
    var n = prefix.length;
    Object.keys(prefs).forEach(
        function(k){
            let v = prefs[k];
            if (k.indexOf(prefix) == 0) { //
                myprefs[k.slice(n)] = v
            } else {  // regular pref
                preferencesservice.set(k,v);
            }
        }
    );
};

exports.onUnload = function unload(reason) {
    "uninstall disable shutdown upgrade downgrade" // reasons

    console.log('ending testpilot:', reason)
    for (let k in tpstudies) {
        console.debug("finalizing: ",k);
        tpstudies[k].statuscleanup();
        tpstudies[k].persist();
    }
    // TODO: what should happen with extensions?  Should they go away?
};

var tpdebugmode = function tpdebugmode(thisaddonsandbox){
    let nags = [1,4,10];
    if (! myprefs['indexurl']) {myprefs['indexurl'] = data.url("example/example.json")};
    preferencesservice.set('general.warnOnAboutConfig', false);
    tabs[0].url = data.url('index.html');
    tabs.open("about:config");
    tabs.open("about:addons");
    tabs.open("chrome://global/content/console.xul");
    scratch(thisaddonsandbox);
    Hotkey({ combo: 'accel-alt-j', onPress: function(){scratch(thisaddonsandbox)}})
};

/* prefs / ui actions */
prefs.on('liststudies', function(){
    list_studies();
});
/* interactive debugger */
prefs.on('interactivedebug',function(){
    scratch(thisaddonsandbox);
});
/* sort of force redownload */
prefs.on('reload',function(){
    console.log("forced reload");
    myprefs['indexnextdownload'] = JSON.stringify(0);
    setup_and_run();
});

prefs.on('openhelp',function(){
    switchtab(myprefs['helpurl']);
});

let scratch = function scratch(sandbox,text) {
    // chrome-kit in addons
    if (text === undefined) {
        text = "// "+ self.id+ " Scratchpad \n\n\
console.log(Object.keys(tpstudies)) /* example */" || '// Jetpack scratchpad\n\n';
    }
    let {Scratchpad} = require('scratchpad');
    var myscratch = Scratchpad({
        text: text,
        sandbox: sandbox,  // The addon!
        //open: scratch,
      });
    return myscratch;
};

// how often tp tries to police itself.  other pieces are on slower schedules.
var tp_hygeine_interval = 30*1000;

// main, which pulls it all together!
var main = function(options,callback) {
    console.log("testpilot main.js:main running.");
    observer.add("testpilot",watch);

    myprefs['helpurl']="https://testpilot.mozillalabs.com";

    let staticargs = options.staticArgs;
    // debug mode
    console.log("static args:",JSON.stringify(staticargs));
    setprefs(staticargs.prefs);

    if (staticargs.debug) {
        tpdebugmode(tpaddonsandbox);  // the addon sandbox
    }
    if (staticargs.urls !== undefined) {
        for each (let url in staticargs.urls) {tabs.open(url)}
    }

    setup_and_run(); // will only reload if the json is stale / old

    var tp_heartbeat = timers.setInterval(function() {
        setup_and_run();
    },tp_hygeine_interval);

};


// all exports, for tidiness
exports.main = main;
/*

08:38 < gregglind> thanks John-Galt and jorgev.  My real task is verification, I think.   Testpilot2 studies are add-ons.  TP downloads and installs
                   them.  I want to both a) uninstall them at the end of the study (id is probably enough there) *and* verify that they are the same
                   as specified in tp's config.
08:40 <%jorgev> hashes should suffice, I think
08:40 -!- firebot [firebot@moz-F8C1AF63.carolina.res.rr.com] has quit [Ping timeout]
08:41 <+John-Galt> gregglind: AMO uses InstallTrigger, which can accept a hash, but requires user intervention.
08:41 <+John-Galt> If you're installing via the add-on manager, I think you'll need to do the hashing manually...
08:41 <+John-Galt> Although if you pull them over https it probably wouldn't be an issue.
*/


