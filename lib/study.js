"use strict";

const { Class, mix } = require('api-utils/heritage');
const { Collection } = require("collection");
const data = require('self').data;
const { emit, on, once, off } = require('api-utils/event/core');
const { EventTarget } = require('api-utils/event/target');
const observer = require("observer-service");
const myprefs = require("simple-prefs").prefs;
const Request = require("request").Request;
const timers = require("timers");
let {has} = require('array');

const {extensiontracker} = require("extensiontracker");
const tpstore = new require("tpstore").tpstore;  // TODO, is this gross?  multiple!
const {EventSelector} = require("selectedevents");
const {STATUS} = require("status");
const {ask_experiment_install, ask_survey, ask_experiment_upload, tpbanner} = require('askuser');
const record = require("record");
const {tpnotify,tpobserve} = require('tpchannel');
const {urlize_addon_path,validateOptionsLiberal} = require("tputils");

let DEFAULT_DURATION = exports.DEFAULT_DURATION = 86400;

/* TODOS::

* how to detect the end of experiments?  Make this robust to time zone changes, etc?
*/

/* returns null OR object with keys from disk (prefs) */
let revive = exports.revive = function(id){
    let out = myprefs['config.' + id];
    if (out === undefined) {
        out = null;
    } else {
        out = JSON.parse(out);
    }
    return out;
};


let survey_defaults = exports.survey_defaults = {
    image: data.url("img/home_comments.png"),
    info:  'https://testpilot.mozillalabs.com/',
    phonehome: '',
    studytype: 'simplesurvey',
};

let experiment_defaults = exports.experiment_defaults = {
    image: data.url("img/testPilot_200x200.png"),
    info:  'https://testpilot.mozillalabs.com/',
    phonehome: '',
    studytype: 'experiment',
};


let StudyOptionsRequirements = {
    id:  {
        map: function (val) val.toString(),
        is: ["string"],
        ok: function (val) val.length > 0,
        msg: "id must be a non-empty string."
    },
    studytype: {
        map: function (val) val.toString(),
        is: ["string"],
        ok: function (val) has(['simplesurvey','experiment'],val),
        msg: "studytype must be simplesurvey|experiment."
    },
    duration: {
        map: function (val) Number(val),
        ok:  function (val) val >= 0,
        msg: "duration must be non-negative"
    }
}

let Study = exports.Study = Class({
  initialize: function initialize(config) {
    // default experiment type
    if (config.studytype === undefined) {config.studytype = 'experiment'}
    if (config.duration === undefined) config.duration =  DEFAULT_DURATION;

    // now validate
    var vconfig = validateOptionsLiberal(config, StudyOptionsRequirements);
    this.config = vconfig;
    this.activetimers = new Collection();
    this.activeui = new Collection();
    this.activedownloads = new Collection();
    this.activeobservers = new Collection();
    this.activepagemods = new Collection();
  },
  extends:  EventTarget,
  type: 'Study',

  get studytype(){ return this.config.studytype },

  persist: function() {
    let config = this.config;
    var id = config.id;
    myprefs['config.' + id] = JSON.stringify(config); // let this throw if it does
  },

  get observing() {
    let topics = [x['topic'] for (x in this.activeobservers)]
    return topics.sort();
  },

  get status() { return this.config.status },
  set status(status) {
    if (status === undefined) {
        return this.config.status;
    } else {
        return this.setStatus(status);
    }
  },

  /* Notes on status:
   * 1.  we 'set' early, then do stuff as though that status is now true.
   * 2.  resetting to the same status will kill and re-trigger ui.
   * 3.  use (if (s.status != mystatus), s.status = newstatus) idiom if you
   *     are concerned about this.
   */
  setStatus: function(status){
    let S = STATUS;
    let my = this.config;
    //console.log("STATUS:", this.config.id, this.config.status, '->', status);
    emit(this,'setstatus',{"from":this.config.status,"to":status});
    this.statuscleanup();
    this.config.status = status;  // set 'before success'

    tpnotify({'when':Date.now(), 'message':'setstatus','id':my.id,'from':my.status,'to':status});
    this.persist();  // always persist, in case we die RIGHT NOW.
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
    return status
  },

  // TODO, figure out which of these need to run when.
  statuscleanup:  function(){
    console.log("calling statuscleanup on:", this.config.id);
    this.clearui();
    this.cleartimers();
    this.clearpagemods();
    //this.clearobservers();  // for some statuses, these should persist.
  },

  clearobservers: function(){
    for (let x in this.activeobservers) {
        if (x.topic === undefined || x.obs === undefined) {
            continue
        }
        console.log('killing observer',x.topic,Object.keys(x));
        observer.remove(x.topic,x.obs);
    };
    this.activeobservers = new Collection(); // reset
    return true;
  },

  askinstall: function(){
    console.log("askInstall");
    let my = this.config;
    if (my.askinstall === undefined) my.askinstall = {};
    let attempts = Number(my.askinstall.asks || 0);
    let nextattempt = Number(my.askinstall.nextask || 0);
    console.log('asking to run:', my.id,  'attempt:', attempts);

    let listeners = [];
    listeners.push( this.once("status", function(message){
        console.log("FROM TPBOX", message);
        if (message == "ACCEPTED") {
            this.setStatus(STATUS.INSTALL);
        };
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
    // TODO, this function is quite tangled
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

    console.log("we have extensions");
    for (let extid in extensiontracker.addonsforstudy(id)) {
        console.log("removing addon", extid, id);
        tpbanner({msg:"disabling:" + extid});
        extensiontracker.uninstall(extid,id);
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

  cleartimers: function(){
    console.log('clearing timers');
    for (let x in this.activetimers) {
      // clear both, just in case!
      timers.clearTimeout(x);
      timers.clearInterval(x);
    };
    this.activetimers = new Collection();
  },

  clearpagemods: function(){  // assumption: deleted pagemods don't leak
    delete this.activepagemods;
    this.activepagemods = new Collection();
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
    if (my.observe === undefined) {
        console.log("my.observe undefined");
        my.observe = []
    };

    if (my.observe.indexOf(eventselectors_obs_chan) == -1) {
        my.observe.push(eventselectors_obs_chan);
    }

    // set observer listeners first.
    let obscoll = this.activeobservers;
    console.log("will want to observe:", my['observe']);
    my['observe'].forEach(
        function (topic) {
            console.log("tp adding observer for:", topic,id);
            let cb = function(subject) {record.watch(subject,id)}; // actually recording.
            let o = observer.add(topic,cb);
            obscoll.add({topic:topic,obs:cb});
            console.log("result of add:", o,cb)
            // TODO fix the observer-server.js, which lies here!
            //    add returns *nothing*
    });

    // install any addons, tracking them?
    var addons = my['addons'] || [];
    addons.forEach(function(obj) {
        let {url} = obj;
        console.log("start exp:  ", url);
        extensiontracker.install(urlize_addon_path(url),my.id)
    });

    console.log('starting pagemod, if needed.');
    if (my.eventselectors) {
        console.log(JSON.stringify(my.eventselectors));
        //this.pagemods = [ EventSelector(x,eventselectors_obs_chan) for each (x in my.eventselectors) ];
        my.eventselectors.forEach(function(x){this.activepagemods.push(
            EventSelector(x,eventselectors_obs_chan))});

    }
    my.donetime= 1000 * (Number(my.duration) || DEFAULT_DURATION) + Date.now();
    emit(this,"installed");
  },

}); // end of Study class
