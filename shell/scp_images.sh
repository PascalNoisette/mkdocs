#!/bin/bash
grep '../images/[^) ]\+' 0Keep/* -o | cut -d ':' -f 2 | sed 's$../$$' | sort | uniq |  xargs -n1 -I% scp % 192.168.1.36:/home/pascal/mkdocs/docs/%
