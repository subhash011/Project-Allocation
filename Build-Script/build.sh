#! /bin/bash

#str should be yes if we need to build the frontend
#password should be set in the .env file as PASSWORD
#path is the path of the project directory and should be set in .env as PATH

str=$1
path="/opt/Project-Allocation/"
backend="backend"
frontend="btp-frontend"

pushd "$path"
git pull
popd

pushd "${path}${backend}"
npm ci
popd

pushd "${path}${frontend}"
npm ci
popd

if [ "$str" == "yes" ]
then
	pushd "${path}${frontend}"
	ng build --prod
	popd
fi


pushd $path
pm2 restart all
popd

