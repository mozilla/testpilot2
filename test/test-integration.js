"use strict";

exports.test_integration = function(assert){
    assert.fail("should have integration testing");
};


exports["new studies start at new"] = function(assert){
  assert.fail("nope")
};

exports["ask install calls ask_install"] = function(assert){
  assert.fail("nope")
};

exports["ask upload calls ask_upload"] = function(assert){
  assert.fail("nope")
};

exports["ask install has ui"] = function(assert){
  assert.fail("nope")
};

exports["ask upload has ui"] = function(assert){
  assert.fail("nope")
};

exports["observed channels cause watch call"] = function(assert){
  assert.fail("nope")
};

exports["studies die at the end of their duration"] = function(assert){
  assert.fail("nope")
};

exports["status change (to various) kills ui"] = function(assert){
  assert.fail("nope")
};

exports["status change to collecting creates observers"] = function(assert){
  assert.fail("nope")
};

exports["status change (to various) kills observers"] = function(assert){
  assert.fail("nope")
};

exports["survey studies call ask_survey"] = function(assert){
  assert.fail("nope")
};

exports["when survey is complete, extensions are uninstalled"] = function(assert){
  assert.fail("nope")
};

exports["study reviving into ask install, with < 3 asks again"] = function(assert){
  assert.fail("nope")
};

exports["study reviving into ask install, with >= 3 doesnt asks again"] = function(assert){
  assert.fail("nope")
};

exports["study reviving into ask upload, with < 3 asks asks again"] = function(assert){
  assert.fail("nope")
};

exports["study reviving into ask upload, with >= 3 doesnt asks again"] = function(assert){
  assert.fail("nope")
};

exports["studies persist immediately on status change"] = function(assert){
  assert.fail("nope")
};

exports["private browsing on, recording fails"] = function(assert){
  assert.fail("nope")
};

exports["private browsing off, recording works"] = function(assert){
  assert.fail("nope")
};

exports["on startup, welcome page shows, if first time, then pref goes to false"] = function(assert){
  assert.fail("nope")
};

exports["if show welcome pref is false, welcome page doesnt show"] = function(assert){
  assert.fail("nope")
};

exports["sandbox works for debugging"] = function(assert){
  assert.fail("nope")
};

exports["ask install 'yes' sets status to collecting desktop"] = function(assert){
  assert.fail("nope")
};

exports["ask install 'no' set status to refused on desktop"] = function(assert){
  assert.fail("nope")
};

exports["invalid study specs are invalid"] = function(assert){
  assert.fail("nope")
};

exports["tpbanners can be killed"] = function(assert){
  assert.fail("nope")
};

exports["phone home attempts to call home"] = function(assert){
  assert.fail("nope")
};

exports["survey links attempt to get to survey"] = function(assert){
  assert.fail("nope")
};

exports["more info links get to survey"] = function(assert){
  assert.fail("nope")
};

exports["userpage gets collected data for study"] = function(assert){
  assert.fail("nope")
};

exports["simple page observers 'work'"] = function(assert){
  assert.fail("nope")
};

exports["setting download ts to 0, then calling, will re-get studies.json"] = function(assert){
  assert.fail("nope")
};

exports["rerunning command or heartbeat function wont get studies.json too early"] = function(assert){
  assert.fail("nope")
};

exports["uninstall study removes extensions, unless they were there first, or someone else stills need them."] = function(assert){
  assert.fail("nope")
};

exports["new study.json for same id wont change any study attributes (except kill)"] = function(assert){
  assert.fail("nope")
};

exports["tp observer channel signals all study creation"] = function(assert){
  assert.fail("nope")
};

exports["tp observer channel signals all study revival"] = function(assert){
  assert.fail("nope")
};

exports["tp observer channel signals all study status changes"] = function(assert){
  assert.fail("nope")
};

exports["upload data includes some attributes about user (os, some settings, maybe more)"] = function(assert){
  assert.fail("nope")
};

exports["users have an id"] = function(assert){
  assert.fail("nope")
};

exports["if always upload setting is set, ask upload doesnt trigger ui"] = function(assert){
  assert.fail("nope")
};

exports["from ui page, user can participate in refused survey"] = function(assert){
  assert.fail("nope")
};

exports["from ui page, user can see all studies"] = function(assert){
  assert.fail("nope")
};

exports["(TODO decide this!) from ui page, user can see data that has not yet been uploaded"] = function(assert){
  assert.fail("nope")
};

exports["uploading data clears page"] = function(assert){
  assert.fail("nope")
};

exports["study can upload data 'some where else', depending on config"] = function(assert){
  assert.fail("nope")
};

exports["urls for study.json location, surveys, etc, have a subset of macro vars (os, locale, others) they can use"] = function(assert){
  assert.fail("nope")
};

exports["main with staticargs does stuff (debug, sets prefs, etc.)"] = function(assert){
  assert.fail("nope")
};


