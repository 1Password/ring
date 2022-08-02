#!/bin/bash

rm -rf pregenerated

for FILE in ring/pregenerated/*.obj; do
    if [ -z "$(git diff "$FILE")" ]; then
        git checkout "$FILE"
    fi
done
