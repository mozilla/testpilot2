#TP2 Tutorial and Examples#

##FAQ##

#.  What are the big ideas?

When testpilot runs, it 

1. gets studies from a json file or feeds (pref: extensions.tp2.experiments_sources)
2. parses the json (more below)
3. does the studies and surveys in that file / source

a. installs addons
b. record things to simple storage, or a db, or wherever
c. notifies the user when it's time to upload data.
d. uploads it.  
e. cleans up messes.


how to do a simple survey

(the simplest) 


(simple survey is just a url with arms)
These are the keys
arms can override the 'global' keys


how to do an experiment:

simple - the code in the addon tells tp what to record.

    {id: 'some experiment',
     addons = ['some/path','some/other/path'],
     runaddontp = true,
     ts_start = 1290392183092,
     ts_stop = 1293082134982,
    }

(in the addon:

    var tp = new require("TestPilot").testpilot();
    tp.record("some event");
    
)

medium - the code in an a downloadable js file

    {id: 'some experiement',
     studycode:  'some/url',
     study_md5: '1295810928310298FFAABB',
    }

complex - the recording code is in another jetpackable addon,
(this is how things are now)

Study config supports arms just like in simple survey.



Example Complicated 'index.json' showing off the features:

    {}


## Getting Experiements ##

Exceperiments come in off a json feed, which is loaded an parsed on testpilot startup,
(and at other times, TBD, including forced refresh, daily?)

## Constructing the experiements.json ###

options:

1.  write an `experiments.json` (locally, or remote), change the prefs to point to it.
1.  url endpoint that emits json.

For the *real* production server (http://hg.mozilla.org/labs/testpilotweb/),
there is an "experiments_enabled" directory with json snippets.  `fab buildexperiements`
will pull these together.  

(in tp1, this was called `index.json`)

