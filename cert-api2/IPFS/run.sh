#!/bin/bash
docker pull ipfs/go-ipfs

# config
name="ipfs_host"
port1=4001
port3=5001

export ipfs_staging="staging"
export ipfs_data="data"
docker run -d --name $name -v $ipfs_staging:/export -p $port1:4001 -p 127.0.0.1:$port3:5001 ipfs/go-ipfs:latest
IPFSip=$(docker inspect ipfs_host | grep  -m 1 "IPAddress\"" | cut -d '"' -f 4)
echo $IPFSip
