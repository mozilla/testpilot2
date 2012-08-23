#/* This Source Code Form is subject to the terms of the Mozilla Public
# * License, v. 2.0. If a copy of the MPL was not distributed with this
# * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#  Makefile for Test Pilot 2


TOP ?= $(shell pwd)

EXAMPLE_XPIS = heartbeat foursearches

BUILDVERSION ?= $(shell git log -n1 --no-decorate --format="%h :: %s :: %aN" | python -c "import json,sys; sys.stdout.write(json.dumps(sys.stdin.read().strip()))")

# see http://stackoverflow.com/questions/649246/is-it-possible-to-create-a-multi-line-string-variable-in-a-makefile
define HELPDOC

  build 	- prep js and submodules.  REQUIRED before `cfx xpi`, `cfx run`
  docs      - build docs, usind `d`
  servedocs - serve the built docs at http://localhost:8118/
  examples  - build example studies, useful for demoing
  js        - get ui and extra jetpack modules
  help      - this help.

Note:  some targets are in the make file, some stuff is in `cfx`

endef
export HELPDOC

help:
	@echo "$$HELPDOC"

js:
	# (client libraries)
	curl -sS -L https://github.com/andyet/ICanHaz.js/raw/master/ICanHaz.min.js -o $(TOP)/data/js/ICanHaz.min.js
	curl -sS -L http://documentcloud.github.com/underscore/underscore-min.js  -o $(TOP)/data/js/underscore_min.js
	curl -sS -L http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js -o $(TOP)/data/js/jquery.min.js
	# (addon libraries)
	curl -sS -L https://raw.github.com/julianceballos/sqlite-jetpack/master/sqlite.js -o $(TOP)/lib/sqlite.js
	curl -sS -L https://raw.github.com/Gozala/scratch-kit/master/scratchpad.js -o $(TOP)/lib/scratchpad.js

docs:
	@cd $(TOP)/doc && rm -rf build
	@d && echo "docs at doc/build"  ||  echo "pip install -r requirements-build.txt  # doc requirement"

servedocs: docs
	bash -c 'curl -s "http://localhost:8118/build/" >/dev/null || (cd "$(TOP)/doc" && python -m SimpleHTTPServer 8118 &)'
	@echo "python simpleserver running"
	open "http://localhost:8118/build/"

examples:
	@echo "building example xpis and symlinking them to example_studies"
	@mkdir -p $(TOP)/data/example
	@for p in $(EXAMPLE_XPIS); do \
		cd $(TOP)/example_studies/$$p && cfx xpi && cd $(TOP) && \
		cd $(TOP)/data/example && ln -fs ../../example_studies/$$p/$$p.xpi . && cd $(TOP) ;\
	done
	@cd $(TOP)/data/example && ln -fs ../../example_studies/example.json .

submodules:
	git submodule init && git submodule update

build:  js submodules
	@echo "run cfx xpi ; cfx run  or cfx --help"

xpi:
	cfx xpi --static-args '{"prefs":{"+buildversion": "'${BUILDVERSION}'" }}'
