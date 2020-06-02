#! /bin/bash

#str should be yes if we need to build the frontend
#password should be set in the .env file as PASSWORD
#path is the path of the project directory and should be set in .env as PATH

str=$1
password=$2
path=$3
backend="backend"
frontend="btp-frontend"

pushd "$path"
echo $password | sudo -S git pull
popd

pushd "${path}${backend}"
npm i --save
popd

pushd "${path}${frontend}"
npm i --save
popd

if [ "$str" == "yes" ]
then
	pushd "${path}${frontend}"
	ng build --prod
	popd
fi


# pushd $path
# pm2 restart all
# popd

