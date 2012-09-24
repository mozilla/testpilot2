"use strict";
const askuser = require("askuser");
let study = require('study');
let {uu} = require('tptestutils');

const appname = require("xul-app").name;


exports["test_test_run_askuser"] = function(test) {
  test.pass("Unit test askuser running!");
};


exports.test_tpbanner = function(test){
	test.fail("TODO: write test for tpbanner");
};



exports.test_ask_survey = function(test){
	test.fail("TODO: write test for ask_survey");
};


exports.test_ask_experiment_upload = function(test){
	test.fail("TODO: write test for ask_experiment_upload");
};


exports.test_ask_experiment_install = function(test){
	test.fail("TODO: write test for ask_experiment_install");
};


exports.test_finish_survey = function(test){
	let s =
	test.fail("TODO: write test for finish_survey");
};


require('test').run(exports);
