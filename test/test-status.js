
"use strict";
const status = require("status");

exports["test_test_run_status"] = function(test) {
  test.pass("Unit test status running!");
};



exports["test there are 11 STATUS codes"] = function(test){
    let l = Object.keys(status.STATUS).length;
	test.assert(l == 11,"number of STATUS codes changed to "+l+" This probably has implications.");
};

exports["TODO:  should there be a status state machine?"] = function(test){
    test.fail("decide this");
}
