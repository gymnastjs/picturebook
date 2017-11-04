#!/bin/bash

set -e

dir="$PWD/node_modules/picturebook"

echo "config is $dir/config"
"$dir"/node_modules/.bin/build-storybook -c "$dir/config" $@
