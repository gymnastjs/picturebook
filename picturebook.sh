#!/bin/bash

set -e

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "$dir/config"
./node_modules/.bin/start-storybook -c "$dir/config" $@
