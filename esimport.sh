#!/bin/bash
#curl -XDELETE http://131.111.22.70:9200/test-sedgwick/
# curl -XPUT http://52.16.145.22:9200/test-sedgwick/
# curl -XPUT http://131.111.22.70:9200/sedgwick/id/_mapping --data-binary @esobjectmappings.json
curl -XDELETE http://192.168.16.67:9200/sedgwick/$1/
curl -XPUT http://192.168.16.67:9200/sedgwick/$1/_mapping --data-binary @esmapping2.txt
curl -XPUT http://192.168.16.67:9200/sedgwick/_bulk --data-binary @$1-esbulk.txt
