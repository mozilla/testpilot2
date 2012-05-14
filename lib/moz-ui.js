/*

Author:  Gregg Lind
license:  MPL 2 (for now)

These are standard UI elements for Moz programs

TODOS:

additional functionality
- XUL preferences elements?  should this go here?

*/

"use strict";

const { emit, on, once, off } = require('api-utils/event/core');
const { EventTarget } = require('api-utils/event/target');
const { Panel } = require("panel");
const tabs = require("tabs");
const timers = require("timers");
const { validateOptions: valid } = require("api-utils/api-utils");
const windowUtils = require("window-utils");
const window = windowUtils.activeBrowserWindow;
const validNumber = { is: ['number', 'undefined', 'null'] };
var { Class, mix } = require('api-utils/heritage');


// utils //


// elements //


var notificationbox = exports.notificationbox = function (){
    let thistab = window.gBrowser.mCurrrentBrowser;
    var nb = window.gBrowser.getNotificationBox(thistab);
    return nb;
}


// https://developer.mozilla.org/en/XUL/notificationbox#Notification_box_events
/* callback should register on AlertShow, AlertClose, TODO!

    see:  aboutRights; telemetry notifications (good examples) live at: 
    at http://mxr.mozilla.org/mozilla-central/source/browser/components/nsBrowserGlue.js

    TODO... hideclose?  
    
    Note:  in desktop fx, there is no event fired on close.  We fake this, by
        emitting onto an 'events' EventTarget.
    
*/
var banner = exports.banner =  function(options){
    let {msg,id,icon,priority,buttons,callback,nb} = options;
    if (! buttons) buttons = [];
    if (! id) id = "banner_" +Date.now(); // TODO this is not reliable.
    if (! icon) icon = 'chrome://browser/skin/Info.png';
    if (! nb) { nb = notificationbox()};  
    if ((typeof priority) === "string") {
        priority = nb[priority] || 1  // TODO, throw here?
    } else {
        if (! priority) priority = 1;    
    }
    
    
    var diagbanner = function(banner) {
    ['allNotifications','currentNotification'].forEach(function(x){
        console.log(x,banner[x]);
    });
    };
    
    var alive = function(banner){
        return Boolean(banner['currentNotification']);
    }
    
    let events = new EventTarget();

    let notice = nb.appendNotification(msg,id,icon,
            priority, buttons,callback)
    let deathinterval = 100;
    let deathtimer = timers.setInterval(function() {
      if (! alive(nb)) { 
        console.log("dying");
        emit(events,'AlertClose',notice);
        timers.clearInterval(deathtimer); } 
    }, deathinterval);
    
    return {notice: notice,
        nb: nb, events: events};
        
    
};


/* 
This is just a gussied up Panel, with sensible default args.

width, height on panel is 320 x 240;

hang it on something with "doorhanger().show(element)"
*/
var doorhanger = exports.doorhanger = function(options) { 
    // check for sensible default width, height, etc.
    //for (let k in ['height','width']) {
    //    if 
    //}
    //options.valid({ $: value }, { $: validNumber }).$ || this._width
    console.log("    -- in doorhanger function ");
    console.log(JSON.stringify(options));
    return new Panel(options);
};


/*
    notification box buttons with standard names.
    
    TODO... allow for translations... browserBundle.GetStringFromName
    
    buttons just get a label, not an image, alas!
    
    Example of usage:
    
        banner({msg:"I want to do something", buttons=[nbButtons.yes(
            {callback: function(nb,b) {doSomethingInAddonScope()})
            ]
        })
        
    Don't like the default labels?  Override them!
    
        banner({msg:"if you want this...", buttons=[nbButtons.yes(
            {label: "click here"})
            ]
        })
        
    Or:
    
        banner({msg: "want to", buttons=[nbButtons['click here?']()]});
    
*/ 
var nbButtons = exports.nbButtons = {
};

['yes','no','more','cancel','always','never','details'].forEach(function(label){
    let defaults = {
        label:     label,
        accessKey: null,
        popup:     null,
        callback:  function(aNotificationBar, aButton) {
            // TODO, a sensible default action?  maybe observer emit?
        }
    };
    let f = function(options) {
        if (!options) options = {};
        return mix(defaults,options); // TODO, sorry this is gross!
    };
    nbButtons[label] = f;
});

// this is gross... https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/NoSuchMethod
// but generates buttons with odd labels.  Only on *call* though!
nbButtons.__noSuchMethod__ = function(method,args) {
    let newargs = mix({"label": method},args[0]);
    return this['yes'](newargs);
};

/* 
    anchor the doorhanger somewhere reasonable...
    
    TODO:   should this take a list of what... selectors?  elements?  
            how fancy should this get with the spices?  
    
    usage:  
    
       doorhanger(options).show(anchorit());
*/
var anchorit = exports.anchorit = function(elements){
    if (! elements) {
        elements = ['home-button'];  // Where else should it try to anchorit?
    }
    for each (let guess in elements) {
        let el = null;
        console.log("guessing:", guess);
        if (typeof(guess) == "string") {  
            el = window.document.getElementById(guess);
        } else {  // TODO, this should typecheck against elements, then throw?
            el = guess;
        }
        if (el) {
            console.log("got element!");
            return el;
        };
    };
    return null;  // I got nothin'
};



// open or reopen a tab, based on url.
/* options will only be used in the case of a new tab.  if the tab exists,
   it will just activate
*/
exports.switchtab = function(options) {
    var url = options.url || options;  // tabs.open takes both
    if (! options) options = {};
    for each (let tab in tabs) { 
        if (tab.url == url) {
            tab.activate();
            return tab;
        }
    }
    return tabs.open(options);
};

