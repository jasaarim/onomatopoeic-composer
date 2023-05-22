#! /usr/bin/env bash
set -e
rm build/ -rf
echo "Checking types"
tsc --noEmit
echo "Checking linting"
eslint .
cp -r public/* build/

# Add automatic reload to the app when there is a command line argument
if [ $# -ne 0 ]
then
    sed -i '/<head>/r scripts/hot-reloading.html' build/index.html
fi
