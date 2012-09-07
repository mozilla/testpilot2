const pb = require("private-browsing");
// TODO: yes, it's gross that this requires a 'new'.
const tpstore = new require("tpstore").tpstore;


/* TODO, callbacks here?  promises? */

/*  callback will run on the completion of the record, for now */
var record = function(data,bin,callback) {
    if (! bin) { bin = "UNKNOWN" };
    var now = Date.now();
    console.log("put the string into the record storage db, with the current ts as:");
    console.log("    " + now + ":" + data + ":" + bin);

    // TODO, performance.
    if (pb.isActive) {
        console.log("not storing.  privacy");
    } else {
        console.log("  record, no private browse, to tpstore.");
        tpstore.record(data,bin,now,callback)
    }
};

var watch = function (subject,bin){
    console.log("TestPilot sees:",subject,"bin:",bin);
    bin = bin || "unknown";
    //if (data) bin = data['bin'];
    record(JSON.stringify(subject),bin);
};


exports.record = record;
exports.watch = watch;