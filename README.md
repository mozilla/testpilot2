# Test Pilot 2 #

## about ##

Restartless add-on version of Test Pilot (https://testpilot.mozillalabs.com/)
with more features and a simpler api.

See `doc/` for more info!

## install ##

1. use the mozilla addon-sdk (also known as jetpack):

   * https://addons.mozilla.org/en-US/developers/docs/sdk/latest/
   * https://wiki.mozilla.org/Labs/Jetpack

2. (link in the `cfx` binary to your path somewheres :p)
3. fork and clone

To see it in action:

    make build  # get js, submodules
    cfx run

## debug ##

TP2 knows useful run-time args

    cfx run --static-args '{"debug":true}'
    # or with more power, setting debug, several prefs, and opening urls
    cfx run --static-args '{"debug":true,"prefs": {"+tppref":1,"overall.pref":2},"urls":["somewhe.re"]}'

Interactive Debug:

    "about:addons" > extensions > (testpilot2) > [scratchpad]


## dev ##

please use git flow like workflow:

* `master` is always good
* `develop` is the leading edge
* if you have bug, branch and pull

  $ git checkout -b 31_myfeature
  $ # code, code, hack ....
  $ git push -A upstream

* `brew install git-flow` can help.

To setup build:

    `pip install -r requirements-build.txt`

## test ##

    cfx test

## bugs, feature requests ##

use github issues.  We don't have bugzilla integration running yet.

## inclusion ##

Test Pilot needs your help as a champion, experimenter, or coder.
Whatever your background (nation, language, neurotypical status, physical
ability, sex, gender, orientation, age), you are welcome, and will be
treated profressionally, respected, and valued.

## Awesome Ascii Logo ##

<pre>
    _____  ____  __  _____      ___   _   _     ___  _____     ___
     | |  | |_  ( (`  | |      | |_) | | | |   / / \  | |       ) )
     |_|  |_|__ _)_)  |_|      |_|   |_| |_|__ \_\_/  |_|      /_/_

</pre>

(http://patorjk.com/software/taag/)



