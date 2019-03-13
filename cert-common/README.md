## Install

```
$ npm i
```

## Jest Test

```
$ npm run test:all
```

## Linux Issue

```
Cannot find module './build/Release/scrypt' from 'index.js'

$ npm i -S script
```

## Winows Issue

```
$ npm config set script-shell "C:\\Program Files\\Git\\bin\\bash.exe"
$ npm i
$ npm run test:keytool

> cert-common@1.0.0 test:keytool C:\dadu3\dadu3cert-core\cert-common
> jest 'keytool'

/c/dadu3/dadu3cert-core/cert-common/node_modules/.bin/jest: line 2: sed: command not found
/c/dadu3/dadu3cert-core/cert-common/node_modules/.bin/jest: line 2: dirname: command not found
/c/dadu3/dadu3cert-core/cert-common/node_modules/.bin/jest: line 4: uname: command not found
module.js:549
    throw err;

$ npm config set script-shell "C:/Windows/System32/WindowsPowershell/v1.0/powershell.exe"
$ npm run test:keytool
```

jest debug setup

- Debugging in Visual Studio Code https://code.visualstudio.com/docs/editor/debugging
- Troubleshooting · Jest https://facebook.github.io/jest/docs/en/troubleshooting.html

```
# linux

node --inspect-brk node_modules/.bin/jest 'keytool' --runInBand
# windows
node --inspect-brk ./node_modules/jest/bin/jest.js 'keytool' --runInBand
```
