
"use strict";
const {codeok,urlize_addon_path, validateOptionsLiberal} = require("tputils");
let data = require('self').data;
let myprefs = require("simple-prefs").prefs;

exports["test_test_run_tputils"] = function(assert) {
  assert.ok(true,"Unit test tputils running!");
};


exports.test_codeok = function(assert){
	let expected = [true,true,true,true,true,true,  false,false,false];
	let answers = [];
	[0,200,201,202,'0','200',300,400,500].forEach(function(x){
		answers.push(codeok(x))
	})
	assert.deepEqual(expected,answers);
};

exports['test codeok different with different code set'] = function(assert){
	let allowed = [0];
	let expected = [true,false,false,false];
	let answers = [];
	[0,200,201,202].forEach(function(x){
		answers.push(codeok(x,[0]))
	})
	assert.deepEqual(expected,answers);
}

exports['test codeok okay with strings'] = function(assert){
	assert.ok(codeok('0'));
}

exports.test_urlize_addon_path = function(assert){
	let iurl = myprefs['indexurl'];
	let paths = [
		'addon1',
		'+addon1',
		'http://addon1',
		'https://addon1',
		'ftp://addon1'
	]
	let expected = [
		iurl + "/../" + "addon1",
		data.url('+addon1'.substring(1)),
		'http://addon1',
		'https://addon1',
		'ftp://addon1'
	]
	let answers = [];
	paths.forEach(function(x){answers.push(urlize_addon_path(x))})
	assert.deepEqual(answers, expected)
};


exports['test validateOptionsLiberal'] = function(assert){
	let obj = {a:1,b:2};
	assert.deepEqual(obj,validateOptionsLiberal(obj,{}),'unmentioned keys come through')
}


require('test').run(exports);
