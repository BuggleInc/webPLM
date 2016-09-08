#!/usr/bin/env bash

FILE="../RUNNING_PID"
if [ -f $FILE ];
then
  kill -9 `cat $FILE`
  rm $FILE
fi

./web-plm 
