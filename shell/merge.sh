#!/bin/bash

for i in Divers/* ; do
  if [ -d "$i" ]; then
    sed -i -e '$a\' $i/*md  $i.md
    sed '/^---$/,/^---$/d' $i/*md | sed 's/^# /## /'  >> $i.md
    rm $i/*md
  fi
done

