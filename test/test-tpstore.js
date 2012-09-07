
"use strict";
const tpstore = require("tpstore");

exports["test_test_run_tpstore"] = function(test) {
  test.pass("Unit test tpstore running!");
};



exports.test_tpstore = function(test){
	test.fail("TODO: write test for tpstore");
};

exports["test can handled lots of writes at once"] = function(assert){assert.fail("nope")};

exports["test missed writes are retried"] = function(assert){assert.fail("nope")};

