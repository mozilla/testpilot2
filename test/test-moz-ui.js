var mybanner = tpbanner({msg: 'DESTROY THIS', priority:9});
timers.setTimeout(function() {
    console.log("destroying!",Object.keys(mybanner));
    emit(mybanner,'kill',{});
    },2000);

