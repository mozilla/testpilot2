/* mpl */
"use strict";


/* 

TODO:

* decide on names for things.
* decide about whether to use jquery for eventing here, or native moz.  jquery is much easier,
  but might clash.
* if jquery, should we use the 'live()' style, or just accept that newly created divs won't
  get instrumented
* if jquery, how defensive to be around $ mismatch stuff.
* how to do / name the observer channel that gets reported back.  TP records here,
  but that doesn't go all the way out / up back.  Should it look more like:
  
  observe: channame
  {[about:home],['searchbox'],['*'],channel=['channame']} 

  -or-

  {channame: [<eventor1>, <eventor2>]
  }

* usual caveats about not really being able to observe all events, just enumerated ones.


*/

const { Class } = require('api-utils/heritage');
const data = require('self').data;
const observer = require("observer-service");
const pageMod = require("page-mod");

var record = console.log;
var obschannel = "EventSelector";
var tprecord = function(data){
    console.log("EventSelector, sending:", data);
    observer.notify(obschannel,data);
};


var listify = function(thing) {return Array.prototype.slice.call(thing)}

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
exports.EventSelector = function(options){
	// TODO jquery really the best option here?
	console.log(JSON.stringify(options));
	let signal = "VERYSPECIALMESSAGE";
	let include = options.pages;
	let events = options.events.length ? options.events : ALLDOMEVENTS; 
	let scripts = [];

	for each (let x in options.selectors) {
		console.log(x);
		for each (let y in events) {
			console.log(x,y);
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
    			tprecord(
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



