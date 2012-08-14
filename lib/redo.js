/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*  
Rules:
    fn needs to run 'promise style'!
    * return is success
    * throw on error.
*/


var log = function(){
    let A = Array.prototype.slice.call(arguments).join(" ");
    dump(Date.now() +":" + A + "\n");
};

log("-------");

var { promised,resolve, reject, defer } = require('api-utils/promise');
var timers = require("timers");
var { Class, mix } = require('api-utils/heritage');
var Task = Class({
    initialize:  function(fn,options){
        options = (options === undefined) ? {} : options;
        let defaults = {
            'maxtries':  4,
            'waits':  [.1,.2,.4],
            'attempt': 0,  // this can get mixed over, for restarting
        };
        this.my = mix(defaults,options);
        this.my.fn = fn;
    },
    go: function(){
        // indirection here... we don't want to resolve until the nth attempt
        let deferred = defer();
        this._go(deferred,arguments,this);
        return deferred.promise;
    },
    _go: function(deferred,args,that) {
        let my = that.my;
        let failwait = my.waits[my.attempt] || Math.max(my.waits) || 1;
        my.attempt += 1;
        log("failwait", failwait, "attempt:", my.attempt, my.maxtries);             

        // otherwise, let's go again.
        try {
            return deferred.resolve(my.fn(args));       
        }
        catch(error){
            if (my.attempt >= my.maxtries) {
                log("rejecting!");
                return deferred.reject(error);
            };
            log("errored, delaying");
            timers.setTimeout(function(){
                that._go(deferred,args,that);
            }),1000*failwait;
            return deferred.promise;
        }  // catch
    } // _go
}); 

// testing below

var oops = function oops(){
    if (this.count === undefined) { this.count = 0} ; 
    this.count +=1 ;  
    throw new Error("oh no! " + this.count);
};

var okay = function(){
    return "OKAY"
}

var after2okay = function(){
    if (this.count === undefined) { this.count = 0} ; 
    this.count +=1 ;  
    if (this.count > 2) return "after2okay";
    else {throw new Error("too soon, too soon")};
}

var E= function(error){log("E:",error || "no error given"); throw new Error(error.message) };
var G= function(value){log("G:",value || "no value given"); return value};

Task(okay).go().then(G,E).then(G

,E)  // calls G, G
Task(oops).go().then(G,E).then(G,E).then(G,E);     // calls E, G
Task(after2okay).go().then(G,E).then(G,E);   // calls G, G


// handle errors at the last stage.
Task(oops,{maxtries:1}).go().then(G,E



).then(G,E);


/*

best practices for promises:

* go or throw.  If you return, you get G, if you throw you get E
* all you get is try/catch, fundamentally.
* always return *something*, a promise or a resolution
* if you want to 'keep going' return a promise
* handlers should "go or throw", so the chain ckeeps going.
* handlers should be reboust to "if nothing: return nonthing"
* always handling 'one in the past', or 'what happened yesterday'

*/

