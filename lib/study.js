const { Collection } = require("collection");
const data = require('self').data;
const observer = require("observer-service");
const myprefs = require("simple-prefs").prefs;
const Request = require("request").Request;

const tpstore = new require("tpstore").tpstore;  // TODO, is this gross?  multiple!
const {EventSelector} = require("selectedevents");


var DEFAULT_DURATION = 86400;

/* TODOS::

* how to detect the end of experiments?  Make this robust to time zone changes, etc?
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
    let out = myprefs['config.' + id];
    if (out) {
        out = JSON.parse(out);
    } else {
        out = null;
    }
    return out;
};


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

exports.Study = Class({
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
    let my = this.config;
    console.log("STATUS:", this.config.id, this.config.status, '->', status);
    this.statuscleanup();
    observer.notify('testpilot',{'when':Date.now(), 'message':'setstatus','id':my.id,'from':my.status,'to':status});
    this.config.status = status;  // TODO, is it right to set it here, or after success?
    // TODO, is persisting right here?
    this.persist();

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
    console.log("calling statuscleanup on:", this.config.id);
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

    // uninstall extensions, only if no-one else is using them  TODO
    // TODO, and if they weren't there when we got here.  Messy!
    // For now, we are blunt force.
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
        addoninstaller.installUrl(urlize_addon_path(url)).then(
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
