const main = require("main");

exports.test_test_run = function(assert) {
  assert.ok(true,"Unit test running!");
};

exports.test_id = function(assert) {
  assert.ok(require("self").id.length > 0);
};

exports.test_run_main = function(assert) {
    main.main();
    assert.ok(true)
}


require('test').run(exports);