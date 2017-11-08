#!/bin/bash

set -e

dir="$PWD/node_modules/picturebook"

"$dir"/node_modules/.bin/nightwatch --config test/screenshot/nightwatch.conf.js $@
