#!/bin/bash

PROJECT_DIR=$( cd "$( dirname "$BASH_SOURCE" )" && pwd )
# change to directory with tests
cd $PROJECT_DIR
npm run test
