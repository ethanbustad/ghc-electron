#!/bin/bash

SCRIPT=$(readlink -f "$0")

SCRIPTPATH=$(dirname "$SCRIPT")

cd $SCRIPTPATH

COMMAND=$(command -v npm >/dev/null 2>&1 && echo "npm" || echo "node")

HASH=$(cat npm-shrinkwrap.json | sha256sum | cut -d ' ' -f 1)

if [ ! -e "node_modules" ] || [ ! -e "node_modules/$HASH" ]
then
	$COMMAND install

	touch "node_modules/$HASH"
fi

$COMMAND start