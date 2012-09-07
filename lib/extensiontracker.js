"use strict";

// TODO change this and remove file when https://github.com/mozilla/addon-sdk/pull/525/ lands
//const addoninstaller = require("addon/installer");
const addoninstaller = require("addon-installer");
const array = require('api-utils/array');
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

let ExtensionTracker = Class({
	extends: EventTarget,
	initialize: function(){
		this.revive();
		// set signals to listen for installs, see moz-ui.js for example
		// TODO, should this know to just persist itself on any change?  backbone?
	},
	persist:  function(){
		// put this in json.
		observer.notify("testpilot",{msg: "extensiontracker persisting"});
		myprefs[trackerpref] = JSON.stringify(this.addons);
	},
	revive: function(){
		observer.notify("testpilot",{msg: "extensiontracker reviving"});
		let part = myprefs[trackerpref];
		if (part) {
			this.addons = JSON.parse(myprefs[trackerpref])
		} else {
			this.addons = {};
		};
	},
	uninstall: function(extensionid,studyid){
		// TODO, maybe should return a promise
		// only FAIL on true uninstall failures
		//
		if (safetodelete(extensionid,studyid)) {
			delete this.addons[extensionid];
			this.persist();
			addoninstaller.disable(extensionid);
		} else {
			if (this.addons[extensionid]) {
				array.remove(this.addons[extensionid],studyid);
				this.persist();
			}
		}
		this.persist;
	},
	owner: function(extensionid,ownerid){
		/* get.  if 2nd arg, move first dep to studyid */
	},
	neededby: function(extensionid){
		return this.addons[extensionid]; // list of studyids or undefined
	},
	safetodelete: function(extensionid,studyid){
		let needers = neededby(extensionid);
		return needers && needers.length==1 && needers[0] == studyid
	},
	install: function(url,studyid){
		console.log("INSTALLING", url, studyid);
		addoninstaller.installUrl(url).then(
		function(aAddon) {
			if (this.addons[aAddon.id] === undefined) { this.addons[aAddon] = []};
			array.add(this.addons[aAddon.id],studyid);
		}
        );
	},
	addonsforstudy: function(studyid){
		for (let extid in Object.keys(this.addons)) {
			if (array.has(this.addons[extid],studyid)) {yield extid}
		};
	}
});

let extensiontracker = exports.extensiontracker = ExtensionTracker();  // a singleton object.

