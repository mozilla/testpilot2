$(function(){
	$('pre#showdata').text(window.location);
	var study = window.location.hash.substring(1);
	if (study){
		self.port.emit("getdata",{'id':study});
	}
});


$(function(){
  self.port.on('gotdata', function(studyid,data){
    var that = $('pre#showdata')
    that.empty();
    that.append('<p>data for study: ' + studyid + '</p>');
    that.append(JSON.stringify(data,null,"\t"));
  });


  // delete data call
  $('button#delete').click(function(){
  	var study = window.location.hash.substring(1);
  	self.emit("deletedata",{'id':study});
  })
})

