#Theats and Security#

## tl;dr ##

* naughty addons can listen all the same events, and read all the same data.  
* pushing over Observer just makes it easier to hear the 'good stuff'
* as usual, it relies on the Don't Be Evil tendencies of authors to keep people safe



    14:52 < gregglind> why avoid postMessage?
    14:52 < gregglind> or can you elaborate a bit.  I don't understand the surface there.
    14:53 -!- adamm [adam@moz-4CCAE36B.mycingular.net] has quit [Ping timeout]
    14:53 < dchan> the threat only applies if you are using page-mod/page-worker
    14:53 -!- adamm [adam@moz-4CCAE36B.mycingular.net] has joined #security
    14:53 < dchan> to inject code into the page
    14:53 < dchan> with postMessage, the content window could postMessage something your code doesn't expect
    14:54 < gregglind> right now, the eperiments are jars.  I would like ot simplify that md5'ed (or other hashed, for some 
                       value of hashed) downloadable files are fine as well.  
    14:54 < dchan> with the port.emit / port.on, only your privileged code can create the eents
    14:54 < gregglind> I will have to reflect on that, dchan, thanks!.
    14:54 < dchan> gregglind: there could be use cases where you want postMessage
    14:54 < dchan> but the jetpack paradigm I've seen is to use emit/on where possible


    14:55 < gregglind> the other bit that is risky is that I would like installed addons to be able to signal to tp that it 
                       should record things, by messaging over the Observer bus
    14:56 < gregglind> (and tp can choose to listen to those messages or not),
    14:57 -!- rforbes [rforbes@moz-B1C16B7.tukw.qwest.net] has joined #security
    14:57 < gregglind> that seems to leave a hole open for malicious addons to craft similar messages.
    14:58 < dchan> gregglind: yea, possibly key the message to the type and the addon guid?
    14:58 < dchan> tp client / backend could decide whether to allow the addon messages or not
    14:58 < gregglind> those seem like very easy messages to impersonate.
    14:58 < dchan> though I can definitely see the use case for addon metrics
    14:59 < dchan> gregglind: have the privileged code set the guid identifer
    14:59 < gregglind> Oh yes, my fantasy is that then "what to record" lives with the addon, and tp is just about "believe 
                       those messages between ts1 and ts2"
    14:59 < dchan> though I guess if you are installing a malcious addon
    14:59 < dchan> it could change how tp works
    15:00 < gregglind> you lost me there, but I will look it up :) 

    15:02 < dchan> when you say tp can control the installs
    15:02 < gregglind> indeed, ships in the night.
    15:02 < dchan> is that the same as tp controlling what can register with tp
    15:04 < gregglind> Sorry, TP can install addons.
    15:04 -!- bsmith [bsmith@moz-BBE3ABD.mv.mozilla.com] has joined #security
    15:05 < gregglind> so it can decide to install or not install based on hash, url, etc.
    15:05 < gregglind> then it can keep track of those.
    15:05 -!- bwinton is now known as bwinton_away
    15:06 < gregglind> but to communicate from the addon to TP, the Observer bus seems to be the easiest way
    15:06 < gregglind> TP listens for "tp_record_event" or such, but has no way of knowing if an 'good' addon really sent it.
    15:06 < gregglind> and other naughty addons could listen on the same channel.
    15:07 -!- adamm [adam@moz-4CCAE36B.mycingular.net] has quit [Ping timeout]
    15:07 -!- adamm [adam@moz-4CCAE36B.mycingular.net] has joined #security
    15:07 < gregglind> I am not sure if there is a way around it.
    15:08 < gregglind> unless say, when TP installs the addon, it "gives it" (through some unknown mechanism) a key to sign 
                       messages with.  Sounds very heavy in any case!


