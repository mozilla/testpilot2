# Test Pilot 2 Specification, Capabilities, and Contracts

Guiding Principles

* protect the user from harm
* collect only what is necessary
* make studies conclusive
* respect the value of users time and attention.
* don't record what can't be made public, unless it is absolutely necessary


Goals:

* honor and respect user privacy
* allow full power to modify and experiement with UI
* answer meaningful questions about user behaviour


* active opt-in
* clean up our messes
* respect private browsing mode.  Specifically, database recording is a no-op when private browsing is on.
* studies persist between runs of firefox.

Test Pilot 2 is a restartless, Jetpack addon that:

* can download and run studies
* controlled and configured from a central location (see `studies.json` below)
* uploads collected data
* can install addons, change preferences
* maintains state between runs.



We Prompt the User
* on new study startup
* on data upload


Cleaning Up After Ourselves

* on completion of studies, we rolling back the UI to starting state, including uninstall all addons
* when installing addons, we record whether the user already had it installed.
* the 'id' is our canonical name for an addon.  Not 'id' + version or anything like that.  If your experiment depends on specific versions, it's up to you detect that,  repackage them or otherwise get them onto the users system.



Flight Control

* from `index.html`, users can view running and historical studies
* users can show or delete data (though data may be gone after upload)
* users can opt-in of studies they missed, or cancel running studies.
* additional more powerful debugging can be found at `about:addons`, including in-addon-context scratchpads.




Security and Privacy
* data is destroyed after upload.
* is there a 'safe' subset of information to collect, like OS and other UA information, that we can assume is available anywhere
* all communication with TestPilot is over Observer channels.
* verification of addons and study.json.  Is https enough?  Do we need to verify hashes?

Central Command

* `studies.json` lives on a Mozilla server, and has configuration about all running studies.
* updates here are a reflected on next download.
* 'first in wins'.  Changes in `studies.json` (description, duration, etc.) don't affect running studies.  `kill` is the only exception.
* `kill` is the ONLY way of stopping a study early.  It should be used in cases where study code is mis-behaving in the wild.



TO BE DECIDED

* are studies 'phoning home' when they are offered too invasive?  Should that have an opt-out?

* what if tp is turned off?  Should it remove the extensions it installed?  Confirm with the user?
* are banners the 'right' way of asking questions on desktop?  They are persistent.

