/*  get the four kind of searches!

1. urlbar
2. searchbar
3. right-click context search
4. search from home page

based on testpilotweb 'heatmap' study:
http://hg.mozilla.org/labs/testpilotweb/file/tip/testcases/heatmap/desktop-heatmap-2012.js
*/

"use strict";

const data = require('self').data;
const self = require('self');
const activeWindow = require("windows").activeWindow;
const observer = require("observer-service");
const windows = require("windows").browserWindows;
const windowUtils = require("window-utils");


// Utilities

var record = console.log;
var obschannel = "foursearches";
var tprecord = function(data){
    console.log("     FOURSEARCH, about to send", data);
    observer.notify(obschannel,data);
};


var _lastSearchTerm = '';
var newEngine = function(searchTerm, searchEngine) {
  /* Are two successive searches done with the same search term?
   * Are they with the same search engine or not?
   * Don't record the search term or the search engine, just whether it's the
   * same or not. */
  if (searchTerm == _lastSearchTerm) {
    if (searchEngine == _lastSearchEngine) {
      exports.handlers.record(EVENT_CODES.ACTION, "searchbar", "",
                              "same search same engine");
    } else {
      exports.handlers.record(EVENT_CODES.ACTION, "searchbar", "",
                              "same search different engine");
    }
  }
  this._lastSearchTerm = searchTerm;
  this._lastSearchEngine = searchEngine;
}

var urlLooksMoreLikeSearch = function(url) {
  /* Trying to tell whether user is inputting searches in the URL bar.
   * Heuristic to tell whether a "url" is really a search term:
   * If there are spaces in it, and/or it has no periods in it.
   */
  return ( (url.indexOf(" ") > -1) || (url.indexOf(".") == -1) );
};


var pageMod = require("page-mod");
var aboutHomeSearch = pageMod.PageMod({
  include: ["about:home"],
  contentScriptWhen: 'ready',
  contentScriptFile: [data.url('jquery.min.js')],
  contentScript: '$("#searchForm").submit(function() {self.port.emit("abouthomesearch"); return true;});',
  onAttach: function(worker) {
    worker.port.on("abouthomesearch", function(msg) {tprecord({action:'about:home search'})});
  }
});


var listen = function(container,type,callback,useCapture) {
    /*  container, type, function, useCapture      

    el.addEventListener("click", modifyText, false);   

    right now, this is gross gross!
    */
    if (!container) {
      console.warn("Can't attach listener: container is null.");
      return;
    }   
    try {
      // Keep a record of this so that we can automatically unregister during
      // uninstall:
      let self = this;
      let handler = function(event) {
        method.call(self, event);
      };  
      container.addEventListener(type,handler,useCpature);
    } catch(ex) {
      console.warn("Failed to attach listener: " + [ex, container,
        eventName, method, catchCap, Error().stack]);
    }   

};
                                           
/*  This won't work because BrowserWindows is too high level... 
    `document` isn't exposed.

windows.on('open',function (window) {
    console.log(Object.keys(window));
    let contextMenu = window.document.getElementById("contentAreaContextMenu");
    contextMenu.addEventListener("command", function(evt) {
        if (evt.target && evt.target.id) {
            record("contentAreaContextMenu", evt.target.id, "click");
        }
    }, true);
});
*/

// inspired by: https://github.com/erikvold/menuitems-jplib/blob/master/lib/menuitems.js
var contextMenuTracker = new windowUtils.WindowTracker({
    onTrack: function(window) {
        console.log("tracking",window.location);
        if ("chrome://browser/content/browser.xul" != window.location) return;
        let contextMenu = window.document.getElementById("contentAreaContextMenu");
        contextMenu.addEventListener("command", function(evt) {
            if (evt.target && evt.target.id) {
                tprecord(["contentAreaContextMenu", evt.target.id, "click"]);
            }
        }, true);
    }                                                
});


