
Race and Indeterminant Scenarios
------------------------------------

debug override

1.  study gets to 'askupload', fires up a banner.
2.  operator sends a 'debug -> reset the study' signal.
3.  is this the right op...

    a. kill any existing ui
    b. reset tasks, dump data, etc?
    c. (how to stop tasks like data upload?!?)
    

firefox shutdown mid study

1.  we get to stage X in a study (running, asking, etc)
2.  shut down firefox
3.  how do we know where to restart?  (check status?)


changing from prefs?


1.  what if I change status from prefs?  Should I listen to that?  



Suggested model:
-------------------

*   exp.status ->  where to restart
*   only allow one call to do()
*   emit/on for 'set status', which allows 'hard restart', which cleans up running ui?
*   'do' functions mostly try to call forward, pooping status along the way?





Random Notes
--------------------





TEST PILOT STATUS MODEL.

status is set at the *beginning* of an operation.   


asking:
    refuse()
    run()
    
askupload()
    upload()
    refuse_upload()
    
upload()
    try it!
    on failure... retry later?



from outside this system, get a 'new'...
    kill all running tasks? 
    


How to guarantee single actor:

E = EventTarget()
E.on('take'){'this  # fanciest!

# this guards itself, DURING RUNTIME
# STATUS allows restart, and should happen at the start of a thing, and is a checkpoint mechanism
# is there set status guard?  No, because who cares?
do():
    if (this.taken) return false  # this is already taken
    
    
    
askinstall:
    attempts++ && askbanner?    (this is always an attempt)
    
during restart...
    statsu is 'askattempt' to try...
    too many, then failout.  




side-effect or direct push?  Are there multiple paths?


there are still possible races thoughout this...

NEW -> askinstall -> install -> running -> askupload -> upload -> success
        if newenough:  attempt ++ && ask
                    try installs, take single?  with flags?
                                if not done yet... wait, else, turn off listeners.
                                        askupload
                                                    try upload
                                                                success!  no more listeners.





this.locked() && return false;
this.lock=true;


study.unlock();

suppose:  

accept that an 'ask' or 'install' or all others block until kill.  

tpbanner() (no response)
tpbanner() (yes)
other one... (no)...

now what is the state?




function lock(callback){
    if (this._locked) { 
        return True
    } else {
        this._locked = true
        callback()
        this._locked = false
    }
}

lock(
    function(this){
    
})
                                        
    
does status change happen at beginning or end?  
if beginning:

    new:
        status = new
        askinstall
    askinstall:
        status = askingstall
        (ask... which callsback...
            callback:  study.install())
    install:
        status = install
        try install:
            error()
            run()
    run:
        status = 'running'
        if lateneough(){
            askupload
        }
    
    askupload:
        status = askupload
        ask



status(new_start)
status(new_end)
status(askinstall_start)
status(askinstall_end)


flags = [history,of,status,changes,or,replay,log]?




NEW -> askinstall -> upload


exp.do() (gets to askinstall)


exp.do()  how do I not trigger it again?


//
once('run') {function... do()}
on('reset') {function.... )



Here is the scenario:

A.  Interrupted study.

1)  start fx.  Install and start running a study.
2)  stop fx.
3)  start fx.  Pick up study where it's at.  (here a flag would be helpful).

B.  study.do() should be idempotent.

1)  start study.
2)  study.do()

C.  what if something changes in the config?  All states should respond appropriately!

1)  duration for example....  
2)  study disappears?  should they continue out their term or die immediately?
3)  kill = true ->  kill all experiments *immediately*  



askinstall():
    callback(status=askinstall)
    


(or anywhere can go to error or ignored)


do():
    this.status.on(change)
    
    switch status:
        NEW:  
            askinstall()  (where it can wait)
        
            
        ASKINSTALL:  
        


    that.askInstall(function(){
      that.install(function() {
        that.done(function() {
          that.askUpload(function(){
            that.upload(function(){
              that.cleanup(function(){console.log("all the way done")});
            })
          })
        })
      })
    })
  },
