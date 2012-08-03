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

    make build
    cfx run

## dev ##

please use git flow like workflow:

* `master` is always good
* `dev` is the leading edge
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

    _____  ____  __  _____      ___   _   _     ___  _____     ___
     | |  | |_  ( (`  | |      | |_) | | | |   / / \  | |       ) )
     |_|  |_|__ _)_)  |_|      |_|   |_| |_|__ \_\_/  |_|      /_/_

(http://patorjk.com/software/taag/)



