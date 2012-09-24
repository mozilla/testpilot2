"use strict";

let {uu,fakestudy} = require('./tptestutils');
let study = require('study');
let {STATUS} = require('status');

exports['test_integration'] = function(assert){
    assert.fail("should have integration testing");
};

exports["test new studies have no status, until set"] = function(assert){
  let fake = fakestudy();
  console.log('assertkeys:',Object.keys(assert))
  console.log(JSON.stringify(fake.config,null,2))
  assert.ok(fake.config.status === undefined);
};

exports["test setting status to ASKINSTALL makes ui"] = function(assert){
  let fake = fakestudy();
  let id = fake.config.id;
  fake.setStatus(STATUS.ASKINSTALL);
  assert.ok(fake.activeui.length)
};


exports["test setting status to ASKUPLOAD makes ui"] = function(assert){
  let fake = fakestudy();
  let id = fake.config.id;
  fake.setStatus(STATUS.ASKUPLOAD);
  assert.ok(fake.activeui.length)
};


/*
exports['test studies can observe channels'] = function(){
  let id = uu()
  let s = study.Study({id:uu(),observe=[id]});
}


exports["test observed channels cause watch call"] = function(assert){
  assert.fail("nope")
};


exports["test studies die at the end of their duration"] = function(assert){
  let fake = fakestudy({duration: 0});
  assert.fail("nope")
};

*/

/* not quite sure how to test this...
exports["test status change (to various) kills ui"] = function(assert){
  let fake = fakestudy();
  let fakeui = {kill: function(){}};
  for (let x in STATUS){
    console.log('STATUS', x)
    fake.activeui.add(fakeui);
    fake.setStatus(STATUS[x]);
    assert.ok(fake.activeui.length == 0, "status clearsui: " + STATUS[x])
  }
  assert.fail("nope")
};
*/

/*
exports["test status change to collecting creates observers"] = function(assert){
  assert.fail("nope")
};

exports["test status change (to various) kills observers"] = function(assert){
  assert.fail("nope")
};

exports["test survey studies call ask_survey"] = function(assert){
  assert.fail("nope")
};

exports["test when study is complete, extensions are uninstalled"] = function(assert){
  assert.fail("nope")
};

exports["test study reviving into ask install, with < 3 asks again"] = function(assert){
  assert.fail("nope")
};

exports["test study reviving into ask install, with >= 3 doesnt asks again"] = function(assert){
  assert.fail("nope")
};

exports["test study reviving into ask upload, with < 3 asks asks again"] = function(assert){
  assert.fail("nope")
};

exports["test study reviving into ask upload, with >= 3 doesnt asks again"] = function(assert){
  assert.fail("nope")
};

exports["test studies persist immediately on status change"] = function(assert){
  assert.fail("nope")
};

exports["test private browsing on, recording fails"] = function(assert){
  assert.fail("nope")
};

exports["test private browsing off, recording works"] = function(assert){
  assert.fail("nope")
};

exports["test on startup, welcome page shows, if first time, then pref goes to false"] = function(assert){
  assert.fail("nope")
};

exports["test if show welcome pref is false, welcome page doesnt show"] = function(assert){
  assert.fail("nope")
};

exports["test sandbox works for debugging"] = function(assert){
  assert.fail("nope")
};

exports["test ask install 'yes' sets status to collecting desktop"] = function(assert){
  assert.fail("nope")
};

exports["test ask install 'no' set status to refused on desktop"] = function(assert){
  assert.fail("nope")
};

exports["test invalid study specs are invalid"] = function(assert){
  assert.fail("nope")
};

exports["test tpbanners can be killed"] = function(assert){
  assert.fail("nope")
};

exports["test phone home attempts to call home"] = function(assert){
  assert.fail("nope")
};

exports["test survey links attempt to get to survey"] = function(assert){
  assert.fail("nope")
};

exports["test more info links get to survey"] = function(assert){
  assert.fail("nope")
};

exports["test userpage gets collected data for study"] = function(assert){
  assert.fail("nope")
};

exports["test simple page observers 'work'"] = function(assert){
  assert.fail("nope")
};

exports["test setting download ts to 0, then calling, will re-get studies.json"] = function(assert){
  assert.fail("nope")
};

exports["test rerunning command or heartbeat function wont get studies.json too early"] = function(assert){
  assert.fail("nope")
};

exports["test uninstall study removes extensions, unless they were there first, or someone else stills need them."] = function(assert){
  assert.fail("nope")
};

exports["test new study.json for same id wont change any study attributes (except kill)"] = function(assert){
  assert.fail("nope")
};

exports["test tp observer channel signals all study creation"] = function(assert){
  assert.fail("nope")
};

exports["test tp observer channel signals all study revival"] = function(assert){
  assert.fail("nope")
};

exports["test tp observer channel signals all study status changes"] = function(assert){
  assert.fail("nope")
};

exports["test upload data includes some attributes about user (os, some settings, maybe more)"] = function(assert){
  assert.fail("nope")
};

exports["test users have an id"] = function(assert){
  assert.fail("nope")
};

exports["test if always upload setting is set, ask upload doesnt trigger ui"] = function(assert){
  assert.fail("nope")
};

exports["test from ui page, user can participate in refused survey"] = function(assert){
  assert.fail("nope")
};

exports["test from ui page, user can see all studies"] = function(assert){
  assert.fail("nope")
};

exports["test (TODO decide this!) from ui page, user can see data that has not yet been uploaded"] = function(assert){
  assert.fail("nope")
};

exports["test uploading data clears page"] = function(assert){
  assert.fail("nope")
};

exports["test study can upload data 'some where else', depending on config"] = function(assert){
  assert.fail("nope")
};

exports["test urls for study.json location, surveys, etc, have a subset of macro vars (os, locale, others) they can use"] = function(assert){
  assert.fail("nope")
};

exports["test main with staticargs does stuff (debug, sets prefs, etc.)"] = function(assert){
  assert.fail("nope")
};


exports["test allow survey and experiment for same study"] = function(assert){assert.fail("nope")};
*/
require('test').run(exports);
