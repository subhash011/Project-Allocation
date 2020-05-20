#! /bin/bash

# if changes in btp-frontend folder use -----> ./build.sh yes
# else use -----> ./build.sh no

str=$1

pushd /opt/Project-Allocation
sudo git pull
popd

if [ "$str" == "yes" ]
then
	pushd /opt/Project-Allocation/btp-frontend/
	ng build --prod
	popd
fi


pushd /opt/Project-Allocation
pm2 restart all
popd