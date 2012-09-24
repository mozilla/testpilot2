
"use strict";
const myprefs = require("simple-prefs").prefs;
const observer = require("observer-service");

const study = require("study");
const {tpnotify,tpobserve} = require("tpchannel");
const {STATUS} = require('status');

let {uu} = require("tptestutils");

const observerprefix = "testpilot-";


exports["test_test_run_study"] = function(assert) {
  assert.ok(true,"Unit test study running!");
};

exports['test revives fine from valid json'] = function(assert){
	let obj = {'id':uu(), duration:100};
	myprefs['config.' + obj.id] = JSON.stringify(obj);
	let r = study.revive(obj.id);
	assert.deepEqual(obj,r);
};

exports['test revives fails from invalid json'] = function(assert){
	let obj = {'id':uu(), duration:100};
	let inv = '{this is borked';
	myprefs['config.' + obj.id] = inv
	assert.throws(function(){study.revive(obj.id)},"invalid json throws revive")
};

exports['test reviving a non-existent study gives null'] = function(assert){
	let obj = {'id':uu(), duration:100};
	let r = study.revive(obj.id);
	assert.deepEqual(r,null,'reviving a non-existent study should give null');
}


exports['test saved studies go to myprefs["config." + id]'] = function(assert){
	let s = study.Study({id:uu()});
	s.persist();
	assert.ok(myprefs['config.' + s.config.id])
}


exports.test_survey_defaults = function(assert){
	assert.ok(study.survey_defaults);
};


exports.test_experiment_defaults = function(assert){
	assert.ok(study.experiment_defaults);
};


exports['test studytype defaults to experiment'] = function(assert){
	let s = study.Study({id:uu(),studytype:'experiment'})
	assert.equal(s.studytype, 'experiment');
}

exports["test surveys exist"] = function(assert){
	let s = study.Study({id:uu(),studytype:'simplesurvey'});
	assert.equal(s.studytype, 'simplesurvey')
};

exports["test experiments exist"] = function(assert){
	let s = study.Study({id:uu(),studytype:'experiment'})
	assert.equal(s.studytype, 'experiment');
};

exports['test allowed types experiment|survey'] = function(assert){
	assert.throws(function(){study.Study({id:uu(),studytype:'bicyclerace'})},
		"should be one of experiment|survey");
}

exports['test studies without ids are not valid'] = function(assert){
	assert.throws(function(){study.Study() /* no id*/ }, "study needs id");
}

exports['test new studies go right to askinstall'] = function(assert){
	let s = study.Study({id:uu(),studytype:'experiment'})
	s.status = STATUS.NEW;  // will to go to ASKINSTALL
	assert.equal(s.status, STATUS.ASKINSTALL, "new -> askinstall");
}


/* die die die */
exports['test uninstalling a study clears any observers'] = function(assert){
	let s = study.Study({id:uu(),studytype:'experiment'})
	s.activeobservers.add({});
	assert.ok(s.activeobservers.length);
	s.uninstall();
	assert.equal(s.activeobservers.length,0,"should be no observers after uninstall")
}

/*
    this.clearui();
    this.cleartimers();
    this.clearpagemods();
*/


exports['test uninstalling a study clears:  activeui, timers, pagemods, activeobservers (and more)'] = function(assert){
	let s = study.Study({id:uu()});

	// test setup
	s.activeobservers.add({});
	assert.ok(s.activeobservers.length);

	s.activeui.add({});
	assert.ok(s.activeui.length);

	s.activetimers.add({});
	assert.ok(s.activetimers.length);

	s.activepagemods.add({});
	assert.ok(s.activepagemods.length);

	// then, uninstall
	s.uninstall();

	// then, result
	assert.ok(s.activeobservers.length == 0 &&
		s.activeui.length == 0 &&
		s.activetimers.length == 0 &&
		s.activepagemods.length == 0,
		'all should be clear after uninstall')
};

exports['test uninstalling a study ALSO clears extensions'] = function(assert){
	assert.ok(false,"check for dead extensions");
}

exports['test install sets observers'] = function(assert){
	let id = uu();
	let s = study.Study({id:id,observe:[id],duration:100});
	s.status = STATUS.INSTALL;
	assert.deepEqual(s.observing,[id,observerprefix + id].sort())
}

exports['test start experiment sets observers'] = function(assert){
	let id = uu();
	let s = study.Study({id:id,observe:[id]});
	s.start_experiment();
	assert.deepEqual(s.observing,[id,observerprefix + id].sort())
};

exports['test start experiment always observes on eventselector channel, just in case'] = function(assert){
	let id = uu();
	let s = study.Study({id:id});
	s.start_experiment();
	assert.ok(s.observing.length==1,'has exactly 1 observers (n)')
	assert.deepEqual(s.observing,[observerprefix + id])
};


require('test').run(exports);

