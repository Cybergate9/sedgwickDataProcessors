#!/bin/bash
#
# NOTE: for deletes (-XDELETE) to work delete_by_query plugin has to be installed in ES
#
echo Process for [$1]

if [ "$1" == "" ]; then
  echo 'Error: filename missing'
  exit
fi
#curl -XDELETE http://131.111.22.70:9200/test-sedgwick/
# curl -XPUT http://52.16.145.22:9200/test-sedgwick/
# curl -XPUT http://131.111.22.70:9200/sedgwick/id/_mapping --data-binary @esobjectmappings.json
curl -XDELETE http://52.16.145.22:9200/sedgwick/$1/_query?q=*
curl -XPUT http://52.16.145.22:9200/sedgwick/$1/_mapping --data-binary @esmapping2.txt
curl -XPUT http://52.16.145.22:9200/sedgwick/_bulk --data-binary @$1-esbulk.txt
