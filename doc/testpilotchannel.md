Test Pilot Channel
====================

These are logged to global observer channel "testpilot"

// 8     observer.notify('testpilot',{'when':Date.now(), 'message':'setstatus','id':my.id,'from':my.status,'to':status});

All messages have:

* when:  (microsecond, from Date.now() or such)
* message:  singleword
* (other args, per message)


Messages:

* setstatus -> status changes for experiments,
  keys:  id, from, to

* startup -> testpilot starting
  keys:  reason (=loadReadon)

* shutdown -> testpilot shutdown
  keys:  reason (=loadReason)


(TBD)

* (interact? could be for uishown, askinstall, etc.)

* uishown? ->  (TBD)

* addon? -> (TBD)
  keys:  studyid, addonid, result (=blocked|success|fail? TBD), dependency chain?

* studies.json?
  url, success, experiments?



