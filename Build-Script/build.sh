#! /bin/bash

#type yes if there are changes in btp-frontend folder
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