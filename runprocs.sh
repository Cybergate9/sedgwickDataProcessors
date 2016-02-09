#!/bin/bash
echo Process for [$1]
if [ $1 = '' ]; then
  echo 'Error: filename missing'
  exit
fi
echo 1. pre process..
node preproc.js -f $1-up.txt > $1-pp.txt
echo 2. data process..
node dataproc.js -f $1-pp.txt > $1-json1.txt
echo 3. remap JSON..
node remapproc.js -f $1-json1.txt > $1-json2.txt
echo 4. create ES bulk file..
node espreproc.js -f $1-json2.txt > $1-esbulk.txt
echo 5. removing temporary files
rm $1-pp.txt & rm $1-json1.txt & rm $1-json2.txt

