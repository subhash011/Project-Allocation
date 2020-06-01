#! /bin/bash

# if changes in btp-frontend folder use -----> ./build.sh yes
# else use -----> ./build.sh no

str=$1
path="/home/subhash011/Desktop/Project-Allocation/"
backend="backend"
frontend="btp-frontend"
echo "$str"

pushd "$path"
echo '1234' | sudo -S git pull
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

