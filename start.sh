#!/bin/bash

SCRIPT=$(readlink -f "$0")

SCRIPTPATH=$(dirname "$SCRIPT")

cd $SCRIPTPATH

COMMAND=$(command -v npm >/dev/null 2>&1 && echo "npm" || echo "node")

if [ ! -e "node_modules" ]
then
	$COMMAND install
fi

$COMMAND start