#!/bin/bash

SCRIPT=$(readlink -f "$0")

SCRIPTPATH=$(dirname "$SCRIPT")

cd $SCRIPTPATH

if [ ! -e "node_modules" ]
then
	npm install
fi

npm start