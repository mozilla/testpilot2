import json
import os
import os.path
import sys
import time

from fabric.api import task, sudo, run, local, lcd, cd, env,hosts
from fabric.contrib.console import confirm

here = os.path.dirname(sys.argv[1])

def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST:
            pass
        else: raise

@task
def cover():
	with lcd(here):
		local("rm -rf fakey && mkdir -p fakey/lib"
			" && cp -r data doc test package.json fakey"
			" && ~/gits/CoverJS/bin/coverjs -o fakey/lib `find lib -name '*js'`"
			" && cp lib/coverobject.js  fakey/lib")
		try:
			local(" cfx test --pkgdir=fakey")
		except:
			pass
		time.sleep(2);
		local("node coveritall.js > coverage.html ; open coverage.html")
		coverstats()

@task
def coverstats():
	with lcd(here):
		local("grep -o '<h1>.*</h1>' coverage.html | perl -pe 's|</?h1>||g'  |sort ")


