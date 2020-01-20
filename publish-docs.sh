#!/bin/bash

# Build docs
npm run build-docs
# Switch to gh-pages branch
git checkout gh-pages
# Pull changes, if any
git pull --rebase origin gh-pages
# Remove old build
rm -rf docs.* index.html
# Copy everything from build to root
cp ./dist-docs/* ./
# Commit with current time
git add docs.* index.html
# Commit with current time
git commit -a -m "Demo updated `date +'%Y-%m-%d %H:%M:%S'`"
# Push changes
git push origin gh-pages
# Switch back to the branch
git checkout -
