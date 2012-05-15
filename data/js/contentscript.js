/* scripts for all pages 

This should run in ADDON SCOPE in a worker 

assume:

jquery, underscore, iCanHaz.js
*/


$(function() {
    self.port.on('populatestudies', function(studies){
        var experiments = $("#experiments");
        var simplesurveys = $("#simplesurveys");
        experiments.empty();
        simplesurveys.empty();
        
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

