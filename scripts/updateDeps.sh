#!/bin/bash

set -eux

# Update dependencies
yarn upgrade --latest
pushd sampleFolder
  yarn upgrade --exact --latest
popd

# Update flow definitions
rm -rf flow-typed/npm
yarn flow-typed update-cache
yarn flow-typed install --overwrite --skip

yarn ci
