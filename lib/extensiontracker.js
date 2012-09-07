"use strict";


const { Class, mix } = require('api-utils/heritage');
const { Collection } = require("collection");
const data = require('self').data;
const { emit, on, once, off } = require('api-utils/event/core');
const { EventTarget } = require('api-utils/event/target');
const observer = require("observer-service");
const myprefs = require("simple-prefs").prefs;

let USER = 'THIS IS AN EXTREMELY UNLIKELY THING FOR A STUDY TO BE NAMED.';

/*
Algorithm and structures:

1.  First startup, get all installed addons, assign first dependent to USER.
2.  Whenever we INSTALL an addon:
	* check for installed addons, update tracker.
	* if it is a new install, set studyid as first dependent, the OWNER
3.  if an addon is already installed, append study id to the list of 'dependents'
4.  when we are ready to uninstall or disable:
	* if we are the sole dependent: UNINSTALL or DISABLE.
	* else:  remove us from the depednents list


Uninstall vs. disable:
* if anyone has asked for "keep", we go to disable.

persist on all changes.

*/


let trackerpref = "extensiontrackerdata";

let Extensiontracker = Class({
	extends: EventTarget,
	initalize: function(){
		this.revive()
		// set signals to listen for installs, see moz-ui.js for example
		this.addons = {};
	},
	persist:  function(){
		// put this in json.
		myprefs[trackerpref] = JSON.stringify(this.addons);
	},
	revive: function(){
		this.studies = JSON.parse(myprefs[trackerpref]) || {};
	},
	uninstall: function(extensionid,study){
		// return a promise
		// only FAIL on true uninstall failures
		//
	},
	owner: function(extensionid,ownerid){
		/* get.  if 2nd arg, move first dep to studyid */
	},
	neededby: function(extensionid){
		return this.addons[extensionid]; // list of studyids or undefined
	},
});

let extensiontracker = exports.extensiontracker = ExtensionTracker();  // a singleton object.

