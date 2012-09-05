const appname = require("xul-app").name;
const { Class, mix } = require('api-utils/heritage');
const data = require('self').data;
const Request = require("request").Request;

const { STATUS } = require("status");
const {switchtab,banner,doorhanger,nbButtons:B,anchorit} = require("moz-ui");


console.log("IAM ASKUSER<>>>>>> TREMBLE!");
console.log(JSON.stringify(STATUS));

// in seconds  TODO, pref (for testing)?
var nags = [0,60*5,60*60,60*60*24];

// user facing widgets... display data, panels, doorhangers, etc.

var tpbanner = function(options){
    // {msg,id,icon,priority,buttons,callback,nb} = options;
    let stdoptions = {
       icon: data.url("img/testpilot_16x16.png"),
       priority: 3
    };
    options = mix(stdoptions,options);
    return banner(options);
};

/* try ours, then fallback of anchorit.  Should  */
var hangspot = function(ids){
    if (! ids) { ids = ['feedback-menu-button']; }
    return anchorit(ids) || anchorit();
};

// TODO, turn this into a promise...
var ask_experiment_install_desktop = function(study){
    var decided = false;
    var tpb = tpbanner({
        msg: "new study:  " + (study.config.headline || study.config.id),
        buttons: [
        B['more info']({
            callback:  function(nb,b) {console.log("wanted: more info!")
                more_info(study);
                return true // keep the bar
            }
        }),
        B.no({callback:  function() { decided=true; study.setStatus(STATUS.REFUSED)}}),
        B.yes({callback:  function() { decided=true;
            console.log('calling back yes'); study.setStatus(STATUS.INSTALL)}})]
    })

    // remember, we added AlertClose.
    tpb.once("AlertKilled", function(){
        decided=true;   // This is a true 'miss'
    });
    tpb.on("AlertClose",
        function () {
            console.log("banner closing. decided?", decided );
            //(decided) && study.setStatus(STATUS.REFUSED)
        }
    );
    return tpb;
};

var ask_experiment_upload_desktop = function(study){
    var decided= false;
    var tpb = tpbanner({
        msg: "ready to upload:  " + (study.config.headline || study.config.id),
        buttons: [
        B['show collected data']({
            callback:  function(nb,b) {
                console.log("[ see data ] for", study.config.id);
                showdata(study);
                return true; // keep bar around.
            }
        }),
        B['always']({
            callback: function() {decided=true;
                study.setStatus(STATUS.UPLOAD);
                myprefs['uploadwithoutprompting'] = true;
            }
        }),

        B.no({callback:  function() { decided=true; study.setStatus(STATUS.REFUSED)}}),
        B.yes({callback:  function() { decided=true; study.setStatus(STATUS.UPLOAD)}})]
    });
    return tpb;
};


// actually run the experiments
var finish_survey_desktop = function(survey){
    survey.setStatus(STATUS.COMPLETE);
    survey.persist();
    switchtab(survey.config.url);
};


var ask_survey_desktop = function(survey) {
    /*   Asking about the survey and doing it are pretty much the same thing here
    */
    console.log("#### DOING A SIMPLE SURVEY ####");
    var decided = false;
    if (survey.config.phonehome) {
        Request({ url: survey.config.phonehome}).get();  // we just make the effort!
    }
    // TODO, what if this is 2nd time we offered it?  should we record that we phones home?

    var tpb = tpbanner({
        msg: "new survey:  " + survey.config.headline || (survey.config.summary.slice(0,80)+"..."),
        buttons: [
            B['take survey']({
                callback: function(nb,b){
                    decided=true;
                    finish_survey_desktop(survey);  // We can call that from other pages.
                }
            }),
            B['more info']({
                callback:  function(nb,b) {
                    console.log("wanted: more info!");
                    more_info(survey);
                    return true;
                }
            }),
            B.no({callback:  function() {decided=true; survey.setStatus(STATUS.REFUSED)}})
        ]
    });

    tpb.once("AlertKilled", function(){
        decided=true;   // This is a true 'miss'
    });

    tpb.on("AlertClose",
        function () {
            console.log("banner closing. decided?", decided );
            //(!decided) && survey.setStatus(STATUS.REFUSED)
        }
    );
    return tpb;
    // PANELS / DOORHANGERS are *TERRIBLE*:  ephemeral, no jquery events (only xul)!
};


exports.tpbanner = tpbanner;

/*
    this implies that there is an interface for 'ask_' actions.
    Each takes a study object, and is expected to manipulate it.
*/


switch (appname) {
    case "Firefox":
        exports.ask_survey = ask_survey_desktop;
        exports.ask_experiment_upload = ask_experiment_upload_desktop;
        exports.ask_experiment_install = ask_experiment_install_desktop;
        exports.finish_survey = finish_survey_desktop;
        break;
    case "Fennec":
        throw Error("we don't know how to run UI on mobile yet");
        break;
    default:
        throw Error("no ui available on platform: " + appname);
};




