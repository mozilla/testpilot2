"use strict";

// utilities?
let {has} = require('array');
let {data} = require('self');
let myprefs = require("simple-prefs").prefs;
let {validateOptions} = require('api-utils/api-utils');


let codeok = exports.codeok = function(s, codes) {
    if (codes === undefined) { codes = [0,200,201,202]; };
    let c = [];
    for (let ii in codes) {c.push(String(codes[ii]))}
    return has(c,String(s));
};

// TODO, yuck.  uses pref, mangles paths, fragile.
let urlize_addon_path = exports.urlize_addon_path = function(fileid) {
    /* this is toally weak-tea and unreliable...! ":" in string! */
    if (/:/.test(fileid)) { return fileid }
    if (/^\+/.test(fileid)) {return data.url(fileid.substring(1))}
    else {return myprefs['indexurl'] + "/../" + fileid}
};


let validateOptionsLiberal = exports.validateOptionsLiberal = function(options,requirements){
	let out = validateOptions(options,requirements);
	for (let k in options) {
		if (! (k in requirements)){
			out[k] = options[k] // unvalidated
		}
	}
	return out
}