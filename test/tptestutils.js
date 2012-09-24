const {uuid} = require('api-utils/uuid')
const {Study} = require('study');

let uu = exports.uu = function(){
	return uuid().number.slice(1,-1)
};

/*
exports.test_url = function(test) {
  require("request").Request({
    url: "http://www.mozilla.org/",
    onComplete: function(response) {
      test.assertEqual(response.statusText, "OK");
      test.done();
    }
  }).get();
  test.waitUntilDone(20000);
};
*/

let urlok = exports.urlok = function (url,timeout){
	if (timeout === undefined) timeout = 20000;
	return function(test){
		require('request').Request({
			url:url,
			onComplete: function(response){
				test.assertEqual(response.statusText, "OK")
				test.done()
			}
		}).get();
		test.waitUntilDone(timeout)
	}
}


// for these two, generate a random id.
let fakestudy = exports.fakestudy = function(options){
	if (options === undefined) options = {}
	if (options.id === undefined) options.id = "study-" + uu();
	return Study(options);
}

let fakesurvey = exports.fakesurvey = function(options){

};

