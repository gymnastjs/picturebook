#!/bin/bash

set -e

dir="$PWD/node_modules/picturebook"

"$dir"/node_modules/.bin/jest --config "$dir"/jest.config.js $@
