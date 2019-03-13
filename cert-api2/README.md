# cert-api2

## Description

api 5.0

## Installation

```bash
$ npm install

$npm link ../cert-contract ../cert-common
```

##  IPFS

1. 安裝docker
2. IPFS會佔用3個port所以要事先到run.sh或private.sh把使用port設定好。
3. 去cert-api2/config/config.js設定ipfs的ip、port

### public IPFS

```bash
$ cd IPFS

$ ./run.sh  ( 要先設定佔用的port )
```

default IPFS名字為ipfs_host。

### private IPFS

```bash
$ cd IPFS

$ ./private.sh  ( 要先設定佔用的port )

$ docker exec ipfs_host ipfs bootstrap rm --all

$ docker exec ipfs_host ipfs id ( 查看ipfs_host的id )

其他node加入ipfs_host的private net

$ docker exec [container name] ipfs bootstrap add [ipfs_host id]
```

### docker

#### 查看IPFS container

> docker ps  ( 查看IPFS container的狀況)

#### 進入IPFS container

> docker exec -it ipfs_host sh

#### 查看IPFS bootstrap list

> docker exec ipfs_host ipfs bootstrap list

#### 查看ipfs swarm peers

> docker exec ipfs_host ipfs swarm peers


### private network Swarm key產生

```bash
$ go get -u github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen

$ ipfs-swarm-key-gen > ./IPFS/swarm.key  ( swarm key產生在IPFS這個資料夾內)
```

### 測試

使用 cert-api2/index.html


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 測試單一檔案

```bash
   "test:e2e": "jest initial --runInBand --config ./test/jest-e2e.json"
```


## 常見問題

- [T1] Error: Cannot find module './build/Release/scrypt' :  [sol] node_modules/scrypt/index.js  中build/Release/scrypt 改成  require("scrypt") 三處皆要改
- [T1] Error: spawn identify ENOENT : [sol] 安裝 yum install ImageMagick (浮水印套件需要)


