
"use strict";
const extensiontracker = require("extensiontracker");

exports["test_test_run_extensiontracker"] = function(test) {
  test.pass("Unit test extensiontracker running!");
};



exports.test_installed_extensions = function(test){
	test.fail("TODO: write test for installed_extensions");
};


exports["test extensiontracker persists"] = function(assert){assert.fail("nope")};

exports["test extensiontracker checks what is installed before allowing an uninstall by testpilot"] = function(assert){assert.fail("nope")};

exports["test okay to uninstall if it was yours and no one else needs it"] = function(assert){assert.fail("nope")};


