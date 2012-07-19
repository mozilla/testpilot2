const { Cu } = require("chrome"),
      AddonInstaller = require("api-utils/addon/installer"),
      ObserverService = require("observer-service"),
      { id, data } = require("self");

const testFolderURL = module.uri.split('test-utils.js')[0];
const ADDON_URL = testFolderURL + "fixtures/testpilot2-fake.xpi";
const ADDON_PATH = require("test-harness/tmp-file").createFromURL(ADDON_URL);

exports.test_run = function(test) {
  test.pass("Unit test running!");
};

// Installs the Test Pilot Fake add-on
// Then attempts to use the notify function from the module
// Waits for the notification to come through the observer service
exports.test_notify = function(test) {
  var subject = { "test" : "a test" };

  ObserverService.add(id, function(aSubject, aData) {
    //console.log("subject", aSubject, "data", aData);
    test.assertEqual(subject, aSubject, "subjects are not equal");
    test.done();
  });

  AddonInstaller.install(ADDON_PATH).then(function success(value) { require("utils").notify(subject); })
  test.waitUntilDone(10 * 1000);
};
