#!/usr/bin/env python

import os
import os.path as p
import re
import subprocess
import sys

"""
pass in a list of filenames.  they will go to test/<fnbase>.js with a test
for each exported function.



TODO:  beef it up to handle paths and such
"""

import os, errno

# note, seriously, this is so annoying in python!
def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc: # Python >2.5
        if exc.errno == errno.EEXIST:
            pass
        else: raise



t = """
"use strict";
const main = require("{mname}");

exports["test_test_run_{mname}"] = function(test) {{
  test.pass("Unit test {mname} running!");
}};

"""

t2 = """
exports.{functionname} = function(test){{
	test.fail("TODO: write test for {functionname}");
}};
"""

def downone(filepath):
	""" note, only works on relative paths.  ugh """
	parts = filepath.split(p.sep,1)
	return parts[1] if (len(parts) > 1)  else ""

def exported(fn):
	# this regex is only mostly right.  Sorry!
	return re.findall('exports\.([a-zA-Z_0-9]*)',open(fn).read())

def main(filenames,check=False):
	for x in filenames:  # should be like lib/*.js or such!
		tmp = downone(x)
		newpath = p.dirname(tmp)
	 	mname = p.splitext(p.basename(tmp))[0]
	 	tname = p.join('test', newpath, 'test-%s.js' % mname)
		#print mname, tname

		if not p.exists(tname):
			with open(tname,'w') as out:
				print "writing to", tname
				print >> out, t.format(**locals())
				for functionname in exported(x):
					print "   function:", functionname
					print >> out, t2.format(**locals())

			if check:
				try:
					cmd = ["/usr/local/bin/js", "-w", "-o", "werror", "-o", "strict", "-C", tname]
					print subprocess.check_output(cmd)
				except subprocess.CalledProcessError as exc:
					print exc.output



if __name__ == "__main__":
   from optparse import OptionParser

   parser = OptionParser()
   parser.add_option("--check", action="store_true", help="invoke syntax checker for each created file.")

   (options, args) = parser.parse_args()
   print options
   main(args,check=options.check)


"""
for testing this:

mkdir -p lib2/a/b/
touch lib2/l{1,2,3}.js
touch lib2/a/aa-{1,2,3}.js
touch lib2/b/bb-{1,2,3}.js
touch lib2/a/b/bb-{1,2,3}.js
tree lib2/
"""


