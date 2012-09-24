"use strict";


let {tpnotify, tpobserve} = require("tpchannel");
let { setTimeout } = require('api-utils/timer');

exports['test notify goes without exception'] = function(assert){
	tpnotify({msg:"FAKEMESSAGE"});
	assert.ok(true);
};

exports['test observe watches notifies'] = function(assert,done){
  	tpobserve(function(data) {
		assert.ok(data.msg == "FAKEMESSAGE" && data.when);
		done();
	});

	setTimeout(function(){
		tpnotify({msg: "FAKEMESSAGE"})
	})
}

/* already too late for this one by the time the test runs
exports['test startup fires event'] = function(assert,done){
	tpobserve()
}
*/

require('test').run(exports);
