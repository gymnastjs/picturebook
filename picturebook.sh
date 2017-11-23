#!/bin/bash

set -e

dir="$PWD/node_modules/picturebook"

echo "config is at $dir/config"
"$dir"/node_modules/.bin/start-storybook -c "$dir/config" $@
