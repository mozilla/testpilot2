/*

Author:  Gregg Lind
license:  MPL 2 (for now)

These are standard UI elements for Moz programs

*/

"use strict";

const { Panel } = require("panel");
const { validateOptions: valid } = require("api-utils/api-utils");
const windowUtils = require("window-utils");
const window = windowUtils.activeBrowserWindow;

const validNumber = { is: ['number', 'undefined', 'null'] };


// utils //
var update = function(oldobj, newobj) {
    Object.keys(newobj).forEach(function(k) oldobj[k] = newobj[k]);
    return oldobj;
};

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
    TODO... should this be an 'options' rather than a list of args?
*/
var banner = exports.banner =  function(message,id,icon,priority,buttons,callback,nb){
    if (! buttons) buttons = [];
    if (! id) id = "banner_" +Date.now(); // TODO this is not reliable.
    if (! icon) icon = 'chrome://browser/skin/Info.png';
    if (! nb) { nb = notificationbox()};  
    if ((typeof priority) === "string") {
        priority = nb[priority] || 1  // TODO, throw here?
    } else {
        if (! priority) priority = 1;    
    }
    return {notice: nb.appendNotification(message + " p:"+priority,id,icon,
            priority, buttons,callback),
        nb: nb};
};


/* 
This is just a gussied up Panel, with sensible default args.

width, height on panel is 320 x 240;

hang it on something with "doorhanger().show(element)"
*/
var doorhanger = function(options) { 
    // check for sensible default width, height, etc.
    //for (let k in ['height','width']) {
    //    if 
    //}
    //options.valid({ $: value }, { $: validNumber }).$ || this._width
    return Panel(options);
};


/*
    notification box buttons with standard names.
    
    TODO... allow for translations... browserBundle.GetStringFromName
    
    buttons just get a label, not an image, alas!
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
        return update(update({},defaults),options); // TODO, sorry this is gross!
    };
    nbButtons[label] = f;
});


// open or reopen a tab 
exports.reopentab = function(url) {
    
};