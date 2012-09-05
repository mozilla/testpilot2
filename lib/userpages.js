const data = require('self').data;
const {PageMod} = require("page-mod");
const myprefs = require("simple-prefs").prefs;
const tabs = require("tabs");


// ADMIN and DISPLAY PAGES

/*  set up a domain with all the scripts loaded.

    going this way (rather than via tab) allows:

    1.  any url hit in there will 'do the right thing'

    caveats:

    1.  if the addon is off, the js won't pre-inject, and those pages are
        on their own!  maybe in them, have a standard element
        "this page requires TestPilot to be on to work right"

    https://builder.addons.mozilla.org/addon/1051088/latest/



tabs.on('ready', function(tab) {
    if (! tab.url matches ) return;
    var my_js = baseid(url)... +js + js/...


    console.log("fired ready");
    tab.attach({
        contentScriptFile: data.url('test.js')
    })
});

*/




var uipages = PageMod({
  include: self.data.url("index.html") + "*",
  contentScriptFile: [data.url('js/jquery.min.js'),
                    data.url('js/ICanHaz.min.js'),
                    data.url('js/underscore_min.js'),
                    data.url('js/contentscript.js')],
  onAttach: function onAttach(worker) {
    worker.port.emit("attached",'message from page mod');
    console.log("UIPAGES:",worker.url);
    worker.port.on('selfmessage',function(payload){
        console.log("PAGEMOD:",payload);
    });
    worker.port.emit("populatestudies",tpstudies);
    observer.add("testpilot",function(subject,data){
        subject.message == "setstatus" && worker.port.emit("populatestudies",tpstudies);
    });
    worker.port.emit("buildversion",myprefs['buildversion'] || "unknown");
  },
  // at define time, myprefs['buildversion'] is undefined, which is awkward.
  //contentScriptOptions: {'buildversion': myprefs['buildversion']}
});


var showdatapage = PageMod({
  include: self.data.url("showdata.html") + "*",
  contentScriptFile: [data.url('js/jquery.min.js'),
                    data.url('js/ICanHaz.min.js'),
                    data.url('js/underscore_min.js'),
                    data.url('js/showdata.js')],
  onAttach: function onAttach(worker) {
    worker.port.emit("attached",'message from page mod');
    console.log("SHOWDATAPAGE:",worker.url);
    worker.port.on('getdata',function(payload){
        let id = payload.id;
        let data = {'fake':'data'};
        worker.port.emit("gotdata",id,data);
    });
  }
});



var showdata = function(studyid,callback) {
    console.log("get the data and show in a new tab ");
    tpstore.retrieveStudyData(studyid,function(userData){
        console.log("DATA FOR STUDY:  ", studyid, "is:");
        console.log(JSON.stringify(userData));
    });
    switchtab(data.url("showdata.html") + "#" + studyid);
    // maybe on that page, it requests the data from the addon?  it can emit.
};

var list_studies = function(studies){
    // to users!
    let uri = data.url('index.html');
    let tab = switchtab(uri);
};


// TODO, fragments aren't there at first, so this doesn't 'home in' right.
var more_info = function(study){
    let studyid = study.config.id;
    let uri = data.url('index.html#study-' + studyid);
    let tab = switchtab(uri);
};