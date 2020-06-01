#! /bin/bash

# if changes in btp-frontend folder use -----> ./build.sh yes
# else use -----> ./build.sh no

str=$1

echo "$str"

pushd /home/subhash011/Desktop/Project-Allocation/
echo '***REMOVED***' | sudo -S git pull
popd

pushd /home/subhash011/Desktop/Project-Allocation/backend/
npm i --save
popd

pushd /home/subhash011/Desktop/Project-Allocation/btp-frontend/
npm i --save
popd

if [ "$str" == "yes" ]
then
	pushd /home/subhash011/Desktop/Project-Allocation/btp-frontend/
	ng build
	popd
fi


# pushd /home/subhash011/Desktop/Project-Allocation
# pm2 restart all
# popd
