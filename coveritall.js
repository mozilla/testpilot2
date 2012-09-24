#!/usr/bin/env node

// var HTMLReporter = require('../lib/reporters/HTMLReporter');

coverobj = require("/Users/glind/tp2_coverstats.json");
var HTMLReporter = require('./Coverjs/lib/reporters/HTMLReporter');
//var reporter = new HTMLReporter(global.__$coverObject);
var reporter = new HTMLReporter(coverobj);
console.log(reporter.report());
