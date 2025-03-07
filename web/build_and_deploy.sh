#!/bin/bash

set -eu

SCRIPTPATH=$( cd "$(dirname "$(readlink -f "$0")")" || exit 1 ; pwd -P )
cd "$SCRIPTPATH"

./build.sh

rm -rf hosting_repo
git clone git@github.com:Finomnis/camera-delay-sim.git hosting_repo -b gh-pages
(
    cd hosting_repo
    rm -rf *
    cp ../dist/* .
    git add .
    git commit -m 'Update content'
    git push
)
rm -rf hosting_repo
