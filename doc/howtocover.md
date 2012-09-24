How to Get Code Coverage in Mozilla Addon Code
================================================

General Plan:

* make a 'fake addon' directory with instrumented code
* run tests on that
* print coverage stats

Prerequisites:


Code to change:

* coverobject module, to store results (ie., like a global)
  but which itself is not instrumented
* someone (`main.js`, probably), has to do the actual reporting


How Addon-sdk Could help:

* put a global object in the test runner / loader called '__$coverObject' or such.
* make it easier to pass options into the test Runner
* modify Require to do block counting automatically, or allow its replacement,
  so the 'node-cover' style tests can occur
* someone from Mozilla (not me!) should better maintain the esprima, escodegen 'moz' branches.
* make it easier to include certain packages for testing only.


Roadblocks:

* escodegen and esprima dont speak moz
* even in moz esprima, I disallow some features:

  * No 'each'
  * No array unpacking:  'for (let [a,b] in thing)'
  * 'of' is not yet supported.

In particular, this means that loops are a bit grosser.  Sorry :(

instrument the code:

*

run using fake package

*


your main should have an unload, that dumps the file somewhere (known, probably)

Something like:

    require('api-utils/unload').when(function(reason){
        if (__$coverObject !== undefined) {
            let file = require('file');
            let { env, pathFor } = require('api-utils/system');
            let out = file.join(pathFor('Home'),'tp2_coverstats.json');
            console.log("COVER TO:", out);
            let outfh = file.open(out,'w')
            outfh.write(JSON.stringify(__$coverObject,null,2));
            outfh.flush();
            outfh.close();
        }
    })


esprima - need gregglind/moz
escodegen - need gregglind/moz?
coverjs - need gregglind/moz

coveritall.js  # based on the coverjs README

    #!/usr/bin/env node

    // var HTMLReporter = require('../lib/reporters/HTMLReporter');
    coverobj = require("/Users/glind/tp2_coverstats.json");
    var HTMLReporter = require('./Coverjs/lib/reporters/HTMLReporter');
    //var reporter = new HTMLReporter(global.__$coverObject);
    var reporter = new HTMLReporter(coverobj);
    console.log(reporter.report());


cd myaddondirectory
rm -rf fakey && mkdir -p fakey/lib && cp -r data doc test package.json fakey && ~/gits/CoverJS/bin/coverjs -o fakey/lib `find lib -name '*js'` && cp lib/coverobject.js  fakey/lib

( cfx test --pkgdir=fakey ) &> out ; node coveritall.js > coverage.html ; open coverage.html

