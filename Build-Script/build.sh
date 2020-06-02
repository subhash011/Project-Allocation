#! /bin/bash

# if changes in btp-frontend folder use -----> ./build.sh yes
# else use -----> ./build.sh no

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

