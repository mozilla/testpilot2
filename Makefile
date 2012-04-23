TOP ?= $(shell pwd)

EXAMPLE_XPIS = heartbeat

help:
	@echo 'some targets are in the make file, some stuff is in `cfx`'


docs:
	@cd doc && rm -rf build  && d
	@echo "docs at doc/build"

servedocs: docs 
	cd doc/build && python -m SimpleHTTPServer 8118 & 


examples:
	@echo "building example xpis and symlinking them to data/example_extensions"
	@mkdir -p $(TOP)/data/example
	@for p in $(EXAMPLE_XPIS); do \
		cd $(TOP)/example_studies/$$p && cfx xpi && cd $(TOP) && \
		cd $(TOP)/data/example && ln -fs ../../example_studies/$$p/$$p.xpi . && cd $(TOP) ;\
	done 
	@cd $(TOP)/data/example && ln -fs ../../example_studies/example.json .

prep:  examples

