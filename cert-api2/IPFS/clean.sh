#!/bin/bash
docker stop test
docker rm test
docker rmi test
docker stop ipfs_host
docker rm ipfs_host