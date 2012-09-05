/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const data = require('self').data;
const { emit, on, once, off } = require('api-utils/event/core');
const { Hotkey } = require('hotkeys');
// TODO change this and remove file when https://github.com/mozilla/addon-sdk/pull/525/ lands
//const addoninstaller = require("addon/installer");
const addoninstaller = require("addon-installer");

const myprefs = require("simple-prefs").prefs;
const observer = require("observer-service");
const prefs = require("simple-prefs");
const preferencesservice = require("preferences-service");
const self = require("self");
const tabs = require("tabs");
const timers = require("timers");

const {tpstudies,setup_and_run, revive_all_studies} = require('centralcommand');
const {switchtab} = require("moz-ui");

console.log("testpilot main.js running.");
console.log("id,uri,version:", self.id,self.uri,self.version,self.data.url(""));


let tpaddonsandbox = this;

/* Functions for Debug and Sandboxing */

/*
 * about:addons 'button' prefs
*/

/* go to flight control */
prefs.on('liststudies', function(){
    liststudies();
});
/* interactive debugger */
prefs.on('interactivedebug',function(){
    scratch(tpaddonsandbox);
});
/* force redownload and rerun */
prefs.on('reload',function(){
    console.log("forced reload");
    myprefs['indexnextdownload'] = JSON.stringify(0);
    setup_and_run();
});

prefs.on('openhelp',function(){
    switchtab(myprefs['helpurl']);
});

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

var tpdebugmode = function tpdebugmode(thisaddonsandbox){
    let nags = [1,4,10];
    myprefs['indexurl'] = data.url("example/example.json")
    preferencesservice.set('general.warnOnAboutConfig', false);
    tabs[0].url = data.url('index.html');
    tabs.open("about:config");
    tabs.open("about:addons");
    tabs.open("chrome://global/content/console.xul");
    scratch(thisaddonsandbox);
    Hotkey({ combo: 'accel-alt-j', onPress: function(){scratch(thisaddonsandbox)}})
};


let scratch = function scratch(sandbox,text) {
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
    // better than https://github.com/Gozala/jep4repl
};

// how often tp tries to police itself, in ms.  other pieces are on slower schedules.
var tp_hygeine_interval = 30*1000;

// main, which pulls it all together!
var main = function(options,callback) {
    console.log("testpilot main.js:main running.");
    observer.add("testpilot",watch);

    myprefs['helpurl']="https://testpilot.mozillalabs.com";  // TODO, why here?

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

    // TODO, should we show anything about 'old' experiments, or just current ones?
    // We always force a download on each first startup.
    myprefs['indexnextdownload'] = JSON.stringify(0);

    if (! myprefs['seenwelcome']) {
        switchtab(data.url("welcome.html"));
        myprefs['seenwelcome'] = true;
    };
    return true;
    revive_all_studies();
    setup_and_run(); // will only reload if the json is stale / old

    var tp_heartbeat = timers.setInterval(function() {
        setup_and_run();
    },tp_hygeine_interval);

};

// all exports, for tidiness
exports.main = main;
