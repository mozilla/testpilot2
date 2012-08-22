/* scripts for all pages

This should run in ADDON SCOPE in a worker

assume:

jquery, underscore, iCanHaz.js
*/


$(function() {
    // TODO, there is some weirdness about how ich loads here
    // and it throws an error.  It needs to load the tpls out of original dom.
    //ich.refresh();
    self.port.on('populatestudies', function(studies){
        var experiments = $("#experiments");
        var simplesurveys = $("#simplesurveys");
        experiments.empty();
        simplesurveys.empty();
        //window.alert(JSON.stringify(Object.keys(ich)));
        $.each(studies, function(key,study){
            let t = study.config.studytype;
            switch (t) {
                case 'simplesurvey':  simplesurveys.append(ich.simplesurvey_tpl(study.config)); break;
                case 'experiment':  experiments.append(ich.experiment_tpl(study.config)); break;
            }
        });
    });
});



$(function() {
    self.port.on('datafromstudy', function(studyid,data){
        var that = $("#recordeddata");
        that.empty();
        that.append('<p>data for study: ' + studyid + '</p>');
        that.append('<p>here is the data...</p>');
    });
});


$(function(){

});
/*

$(function(){
    self.port.emit("selfmessage","from the contentscript");
});


$(function() {
    self.port.on('attached', function(message) {
                         window.alert(message);
    });
    window.alert("saw the message");
});
*/

