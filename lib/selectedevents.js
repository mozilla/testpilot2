/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/*

TODO:

* decide on names for things.
* decide about whether to use jquery for eventing here, or native moz.  jquery is much easier,
  but might clash.
* if jquery, should we use the 'live()' style, or just accept that newly created divs won't
  get instrumented
* if jquery, how defensive to be around $ mismatch stuff.
* (Decided:  testpilot)

  how to do / name the observer channel that gets reported back.  TP records here,
  but that doesn't go all the way out / up back.  Should it look more like:

  observe: channame
  {[about:home],['searchbox'],['*'],channel=['channame']}

  -or-

  {channame: [<eventor1>, <eventor2>]
  }

* usual caveats about not really being able to observe all events, just enumerated ones.
  (at least until... https://bugzilla.mozilla.org/show_bug.cgi?id=779306)

*/

const { Class } = require('api-utils/heritage');
const data = require('self').data;
const observer = require("observer-service");
const pageMod = require("page-mod");

let obschannel = "eventselector";
let sendtotp = function(data,channel){
    console.log("EventSelector, sending:", data);
    observer.notify(channel,data);
};


var listify = function(thing) {return Array.prototype.slice.call(thing)};

/*

from:  https://developer.mozilla.org/En/Code_snippets/QuerySelector

    function $ (selector, el) {
         if (!el) {el = document;}
         return el.querySelector(selector);
    }
    function $$ (selector, el) {
         if (!el) {el = document;}
         return el.querySelectorAll(selector);
         // Note: the returned object is a NodeList.
         // If you'd like to convert it to a Array for convenience, use this instead:
         // return Array.prototype.slice.call(el.querySelectorAll(selector));
    }
    alert($('#myID').id);

*/

/* TODO, get a better list */
const ALLDOMEVENTS = ['click','mouseover'];


// TODO, change this into a heritage maybe?
exports.EventSelector = function EventSelector(options,channel){
	// TODO jquery really the best option here?
	console.log(JSON.stringify(options));
  let signal = "EVENTSELECTORSIGNAL";
	channel =  channel || options.channel || obschannel;
	let include = options.pages;
	let events = options.events.length ? options.events : ALLDOMEVENTS;
	let scripts = [];

	//for each (let x in options.selectors) {
  for ( let sel in Iterator(options.selectors)) {
    x = sel[1];
		console.log(x);
		for (let ev in Iterator(events)) {
      let x = ev[0];
      let y = ev[1];
			console.log(x,y);
      // TODO decide what to send about an event?  Anything jsonable?  targets?
			let s =
				"$(function(evt){"+
				"  $('"+x+"').on('"+y+"', function(){"+
				"    self.port.emit('"+signal+"',{type:evt.type}); return true;"+
				"  });"+
				"});"
			scripts.push(s);
		}
	}
	console.log(JSON.stringify(scripts));

	// TODO, VERYSPECIALMESSAGE should be specific to each mod
	return pageMod.PageMod({
		include: include,
		contentScriptWhen: 'ready',
  		contentScriptFile: [data.url('js/jquery.min.js')],
  		contentScript: scripts,
  		//contentScript: '$(function(){self.port.emit("'+signal+'")});',
  		onAttach: function(worker) {
    		worker.port.on(signal, function(msg) {
    			console.log("~~~~~~~~~~~~~~~~ hearing it! ~~~~~~~~~~~~~~");
    			senttotp(
    			{
    				evt: msg.type,

    			})});
  		}
	})
};


/*
var aboutHomeSearch = pageMod.PageMod({
  include: ["about:home"],
  contentScriptWhen: 'ready',
  contentScriptFile: [data.url('jquery.min.js')],
  contentScript: '$("#searchForm").submit(function() {self.port.emit("abouthomesearch"); return true;});',
  onAttach: function(worker) {
    worker.port.on("abouthomesearch", function(msg) {tprecord({action:'about:home search'})});
  }
});


$("*").on("click mouseover", '*',function(){
  $(this).after("<p>Another paragraph!</p>");
  return false;
});



*/


/*

possible help for the weary

http://www.sprymedia.co.uk/article/Visual+Event+2

*/



