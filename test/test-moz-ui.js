"use strict";
const {switchtab} = require("moz-ui");

const {uuid} = require('api-utils/uuid');
let tabs = require('tabs');

exports["test_test_run_moz-ui"] = function(test) {
  test.pass("Unit test moz-ui running!");
};


exports.test_notificationbox = function(test){
	test.fail("TODO: write test for notificationbox");
};


exports.test_banner = function(test){
	test.fail("TODO: write test for banner");
};


exports.test_doorhanger = function(test){
	test.fail("TODO: write test for doorhanger");
};


exports.test_nbButtons = function(test){
	test.fail("TODO: write test for nbButtons");
};


exports.test_anchorit = function(test){
	test.fail("TODO: write test for anchorit");
};


/* switch tab */

/* todo, these tests aren't working right! */
exports['test if tab is not open, switchtab opens it'] = function(assert){
	let url = "file:///#" + uuid();
	let mytab = switchtab(url);
	if (mytab.url == url) { assert.ok(true) }

}

exports['test if tab is open, switchtab activates it'] = function(assert){
	let url = "file:///#" + uuid();
	tabs.open(url);  // open one
	let mytab = switchtab(url);
	if (mytab.url == url) { assert.ok(true) }
}

require('test').run(exports);



