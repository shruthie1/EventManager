#!/usr/bin/env bash

git checkout 02-express-middlewares-and-request-handlers
git pull --no-edit origin 01-setup
git push

git checkout 03-server-application-design
git pull --no-edit origin 02-express-middlewares-and-request-handlers
git push

git checkout 04-unit-and-integration-tests
git pull --no-edit origin 03-server-application-design
git push

git checkout 05-frontend-and-isomorphic-bundles
git pull --no-edit origin 04-unit-and-integration-tests
git push

git checkout 06-web-security-and-rate-limiting
git pull --no-edit origin 05-frontend-and-isomorphic-bundles
git push

git checkout 07-fflip-feature-toggles
git pull --no-edit origin 06-web-security-and-rate-limiting
git push

git checkout 08-environment-configuration
git pull --no-edit origin 07-fflip-feature-toggles
git push

git checkout master
git pull --no-edit origin 08-environment-configuration
git push

