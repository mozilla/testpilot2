# Change the users Firefox Binary 

the real goal is this:  ux/ui/engineering experiements should be as cheap as possible to put in front of 
people.  Some of those changes are easy to do via addons.  Some are easier to do by pushing a build.
                   

**experiement, idea stage, not yet implemented**

**warning: sharp!**

By far, the most powerful, atomic-bomb, here-there-be-dragons approach to 
experiments.  Want to completely modify this user interface?  

If you are gong to do this, be aware:

*   users will be triple-with-a-cherry-on-top asked to do this, and double opt-in
*   your build needs to have a "help me fix this" reversal procedure before 
    the study will be approved.
*   all other test pilot studies will be suspended for that user until they are back
    on their main branch.


*   https://wiki.mozilla.org/Software_Update:Checking_For_Updates
*   https://developer.mozilla.org/en/XULRunner/Application_Update    
*   https://wiki.mozilla.org/Build:TryServer

Requesting a "real" release Branch
-----------------------------------------------

*   https://wiki.mozilla.org/ReleaseEngineering:ProjectBranchPlanning

example update link
------------------------

https://aus3.mozilla.org/update/1/Firefox/2.0.0.3/2007030919/WINNT_x86-msvc/en-US/release/update.xml


irc discussion
-------------------
    
    10:16 < gregglind> I expect taht if we change people's fx, all other tp experiements have to stop.
    10:16 < gregglind> or be halted.
    10:16 -!- jcarpenter [jcarpenter@moz-C03D0C61.vlan426.asr1.sfo1.gblx.net] has quit [Quit: Leaving...]
    10:22 < jono> hm
    10:22 < jono> tricky
    10:22 < jono> unless the new firefox gets all their addons and prefs
    10:23 -!- jinghua [jzhang@moz-C03D0C61.vlan426.asr1.sfo1.gblx.net] has joined #ur
    10:23 < jono> prefs stick to the profile, i know
    10:23 < jono> and I think addons also stick to the profile?
    10:23 < jono> if not, i know that Sync can sync add-ons now
    10:23 < jono> so maybe we could use that somehow to give the new firefox the addons from the old firefox
    10:23 < jono> hey, is mozilla.com email working for you guys?
    10:24 < jono> it seems to be down for me this morning
    
    
    10:09 < gregglind> how to learn to roll my own fx builds?
    10:09 < gregglind> where are the best trailheads?
    10:13 < gregglind> or is this a release engineering question?
    10:13 -!- mdas [mdas@50AE257C.D30B51A1.412CF160.IP] has quit [Quit: mdas]
    10:18 <@whimboo> gregglind: what do you wanna do?
    10:19 < gregglind> big picture:  for full generality, testpilot could put users temporariliy on custom Fx builds.
    10:19 < gregglind> then bring them back at the end of an experiment.
    10:20 < gregglind> for testing really deep changes.
    10:20 <@whimboo> so what type of 'custom' it applies to?
    10:20 < gregglind> (this is "ux-branch" fully generalized)
    10:21 <@whimboo> so for builds which can be accessed via the FTP server?
    10:21 <@whimboo> like http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/2012-04-25-04-02-05-ux/
    10:22  * gregglind listening
    10:22 <@whimboo> and those also get updates
    10:22 <@whimboo> so not sure if that's enough for you or not
    10:24 < gregglind> so, questions:  how do I get start / built on of those branches   and how do I get users onto it, then safely 
                       back to their old fx
    10:24 < gregglind> can I mod app.update.url, force an update, then get them back in a week?
    10:26 <@whimboo> i would propose to ask that in the dev.platform newsgroup
    10:26 <@whimboo> i'm not sure if that would work and if it's a good idea
    10:26 <@whimboo> there is some risk involved
    10:26 <@whimboo> we don't test cross-channel updates
    10:29 < gregglind> there is tons of risk, that much is clear, and users would have to triple-mega opt-in for it.
    
    
Pseudo-Spec
---------------


As part of doing user research on *deep* changes to UI/UX, we propose that Test Pilot experiments should
be able to *change the firefox binary*, with these constraints

1.  we can move people onto a different build of firefox
2.  we can 'get them back' if something goes bad / at the end of the experiment

Problems / Unknowns
--------------------------

1.  huge, huge, huge security risks.  This is a nuclear option. 
2.  how does one start new branches?   Is this a political, or technical hurdle?
3.  how should we manage the switchover?  We assume it would be:

    * change update xml
    * change `app.update.url`
    * save old pref values
    * force an update (with consent)
    * set the update ts, etc.
    * at end of study, re-use the old values

4. Lots of possible interactions... what if a version update happens during this time... should they just get it
when they switch back? 
5. What is the testing regime for these alternative builds?





bonus:  how to build a custom build hints
----------------------------------------------

https://wiki.mozilla.org/Software_Update:HowToTestMajorUpdateUI

people who know about this stuff live in #build and #automation



    11:38 < gregglind> I want to do some experiements with push-to-try server (basically, trying it out).  is this going to cause 
                       problems (performance etc)
    11:39 < catlee> what kind of experiments?
    11:39 < catlee> how many things will you push?
    11:41 < gavin> you can use trychooser to push a test patch that only triggers 1-2 jobs
    11:41 < gavin> that won't have any significant impact on load
    11:41 < gavin> and would be sufficient to just test that you can do it
    11:42 < lsblakk> gregglind: just push to try with `try: -p {platforms you want} -u none`
    11:42 < mbrubeck> You can also cancel the builds on Try if all you want to do is test pushing.
    11:42 < lsblakk> actually, include -b o
    11:43 < gregglind> thanks gavin.
    11:44 < gregglind> and lsblakk... can you summarize.  I just want to test the pipes, and see that I can make an osx build.
    11:44 < gregglind> hg try <options>.  What is <options>?
    11:44 < gavin> are you using some hg extension?
    11:45 < rail-buildduty> there is TryChooser Syntax Builder: http://trychooser.pub.build.mozilla.org/
    11:45 < lsblakk> gregglind: pull mozilla central, make your changes, then commit and push to ssh://hg.mozilla.org/try
    11:45 < lsblakk> using the syntax (in your commit message) `try: -b o -p macosx64 -u none -t none`
    11:45 < gregglind> Thanks!  Those are all good hings.
    11:45 < gregglind> *hints.
    11:45 < lsblakk> gregglind: ping in here if you hit any problems
    11:45 < gregglind> does it make an update.xml?  Can I test that part too?
    11:45 < lsblakk> you should get a reasonable amount of feedback though
        
    11:56 < gregglind> but when I am in build/debug on experiements, I don't want to bother y'all with every little change.
    11:56 < bhearsum> gregglind: right, but i still don't understand why you feel you need to test the "make firefox update to 
                      something different" part
    11:57 < bhearsum> i understand that you want to test things around that
    11:57 < gregglind> I want a local version
    11:57 -!- brambles [brambles@4CBAB088.F3076E90.1822ACA6.IP] has joined #build
    11:57 < bhearsum> i guess i don't understand why you don't just fake that out for testing purposes
    11:57 -!- minnaminnie is now known as jordain
    11:57 < gregglind> because I want to actually test the user experience of it!
    11:58 < bhearsum> ok!
    11:58 < gregglind> this is a nuclear level sort of thing.
    11:58 < bhearsum> well, you can use app.update.url.override to make Firefox look elsewhere for updates
    11:58 < gregglind> okay, what I am asking then is "how to mock this"
    11:58 < bhearsum> okay
    11:58 < gregglind> and what needs to be at the other end there?
    11:59 < bhearsum> you need the XML file at the other end
    11:59 < gregglind> I am sorry if I misphrased it somehow.
    11:59 < bhearsum> whether that's served by an app, or a static file - you probably don't care
    11:59 < bhearsum> no worries
    11:59 < bhearsum> so, what i'd suggest is to take an existing XML snippet, for example: 
    https://aus3.mozilla.org/update/3/Firefox/11.0a1/20111217031145/WINNT_x86-msvc/en-US/nightly/Darwin%2010.8.0/default/default/update.xml?force=1
    11:59 < gregglind> sure.
    12:00 < bhearsum> and adjust the URL, hash value, and size to point it at whatever you want
    
    11:59 < gregglind> sure.
    12:00 < bhearsum> and adjust the URL, hash value, and size to point it at whatever you want
    12:00 < bhearsum> then you can throw it on a local web server and set app.update.url.override to point at it
    12:00 < gregglind> and a tryserver build would be fine for that (for a known platform, caveat emptor etc)
    12:00 < bhearsum> this sounds a lot like a valid use case for the recently-ripped-out channel switcher :(
    12:00 < bhearsum> gregglind: well, you need a MAR file, not an installer
    12:01 < gregglind> hm.  
    12:01 < bhearsum> i don't think try server produces those...
    12:01 < gregglind> okay, that's a roadblock then :)
    12:01 < bhearsum> if you do a local build, however, you can 'make -C tools/update-packaging' to get one
    12:01 < bhearsum> it's pretty simple
    12:01 < bhearsum> just make sure --enable-application-update is on your mozconfig
    12:02 < gregglind> so no more tryserver then :)
    12:02 < bhearsum> let me double check, but i don't think so...
    
    12:04 < gregglind> anyway to force it?
    12:04 < bhearsum> and it should check for updates, download the MAR, and if you've set-up the XML correctly it will apply it
    12:04 < gregglind> or rather force a checkForUpdate?
    12:04 < bhearsum> gregglind: Help -> About
    12:04 < bhearsum> it's not obvious, but that forces an update check
    12:05 < gregglind> *programmatically* force a check?
    12:05 < bhearsum> oh
    12:05 < bhearsum> sorry :)
    12:06 < bhearsum> gregglind: as an aside, has anyone suggested looking at Channel Switcher for doing this?
    
    12:55 < ehsan> gregglind: use nsIUpdateChecker::CheckForUpdates