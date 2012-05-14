TOP ?= $(shell pwd)

EXAMPLE_XPIS = heartbeat foursearches

# see http://stackoverflow.com/questions/649246/is-it-possible-to-create-a-multi-line-string-variable-in-a-makefile
define HELPDOC

  build 	- does the prep work.  call this before `cfx xpi` or friends.
  docs    -  build docs, usind `d`
  servedocs - serve the built docs at 8118
  examples - build example studies, useful for demoing
  js - get ui and extra jetpack modules
  help -  this help.

Note:  some targets are in the make file, some stuff is in `cfx`

endef
export HELPDOC

help:
	@echo "$$HELPDOC"

js:
	curl -L https://github.com/andyet/ICanHaz.js/raw/master/ICanHaz.min.js -o $(TOP)/data/js/ICanHaz.min.js
	curl -L http://documentcloud.github.com/underscore/underscore-min.js  -o $(TOP)/data/js/underscore_min.js
	curl -L http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js -o $(TOP)/data/js/jquery.min.js
	# extra modules
	curl -L https://bitbucket.org/julianceballos/sqlite-jetpack/raw/tip/sqlite.js -o $(TOP)/lib/sqlite.js

docs:
	@cd doc && rm -rf build  && d
	@echo "docs at doc/build"

servedocs: docs
	bash -c 'curl -s "http://localhost:8118/build/" >/dev/null || (cd "$(TOP)/doc" && python -m SimpleHTTPServer 8118 &)'
	@echo "python simpleserver running"
	open "http://localhost:8118/build/"

examples:
	@echo "building example xpis and symlinking them to data/example_extensions"
	@mkdir -p $(TOP)/data/example
	@for p in $(EXAMPLE_XPIS); do \
		cd $(TOP)/example_studies/$$p && cfx xpi && cd $(TOP) && \
		cd $(TOP)/data/example && ln -fs ../../example_studies/$$p/$$p.xpi . && cd $(TOP) ;\
	done
	@cd $(TOP)/data/example && ln -fs ../../example_studies/example.json .

build:  js
	@echo "run cfx xpi ; cfx run  or cfx --help"

