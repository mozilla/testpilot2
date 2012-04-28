User Interactions 
=======================
                                  
Census of User Interactions with Test Pilot.

*   setup:
    -  (if bundled), accept the global telemetry login  OR 
    -  install the addon the addon
*   at beginning of study
    - install other addons
    - 'accept' a study
    - do an external survey
*   during study
    - see / plot collected data 
*   end of study [see below]
    - upload data?
    - "restore" ui to before (uninstall addons)
*   anytime
    - see all running / completed studies
    - "clear" all data? 
*   uninstall tp / disable
    - clear all data and prefs?

    
### end of study

When a study ends, we need to collect data, and revert the ui.

choices might be (but this is probably too many)

* "submit"
* "don't submit, and delete" 
* "show me first"
* "submit, and always submit without asking from now on" 
* "ask me later"

Perhaps we can *always show* a few lines of data, then offer to show more?


notification options
---------------------

### confirmBox:  a panel with these behaviours ### 

* box for yes
* box for no
* box for later
* hide is "later"

what is *later*?  Maybe this is a series... 5 mins, 1 hour, next day?

### confirmBanner ###

100% wide box, like the one that Telemetry uses for global opt-in

### growl?  ###

Use the notify system to post messages?  


Unanswered questions... 

*   how often / persistent should these interactions be?
*   what if they choose not to participate in a study?
*   should there be menu items?  Addons?  Should it just be a tab?
*   should this all be in the about:testpilot namespace, using
    https://github.com/Gozala/jetpack-protocol
    
