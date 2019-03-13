#!/bin/bash

# config
name="ipfs_host"
port1=4001
port3=5001

docker pull ipfs/go-ipfs
docker create --env LIBP2P_FORCE_PNET=1 --name $name -p $port1:4001 -p 127.0.0.1:$port3:5001 ipfs/go-ipfs:latest
docker cp swarm.key $name:/data/ipfs/
docker start $name
IPFSip=$(docker inspect ipfs_host | grep  -m 1 "IPAddress\"" | cut -d '"' -f 4)
echo $IPFSip
