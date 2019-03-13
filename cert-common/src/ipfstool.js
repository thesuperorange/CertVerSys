var ipfsAPI = require('ipfs-api')
var config = require('../../cert-api2/config/config');                  // read ipfs server ip、port

function IPFSinit() {
  var ipfs = ipfsAPI(config.ipfsconfig.ip, config.ipfsconfig.port, function (err) {
    console.log("error", err)
  })
  return ipfs;
}


function checkID(ipfs) {
  ipfs.id(function (err, identity) {
    if (err) {
      console.log("ipfs is not connected");
    }
    else {
      console.log(identity)
    }
  })
}

// [sttime,edtime,base64file]
function UploadtoIPFS(file, times = 5, expireTime = 10, cb) {    // upload file to ipfs,file parameter is type buffer
  var now = Date.now()          // add time index
  var Datefile = now.toString() + "," + (now + expireTime).toString() + "," + file.toString('base64'); // add time index prefix in file

  Datefile = Buffer.from(Datefile);  // change to buffer
  console.log("Datefile = ", Datefile)
  console.log("now = ", now, "ed = ", (now + expireTime))
  function run() {
    var ipfs = IPFSinit();
    ipfs.files.add(Datefile, function (err, files) {
      times -= 1;
      if (err) {
        console.log("files add to ipfs error")
        if (times <= 0) {
          return cb("files add to ipfs error")
        }
        else {
          ipfs = IPFSinit()
          setTimeout(run, 100);
        }
      }
      var hashDate = now.toString() + "," + (now + expireTime).toString() + "," + files[0].hash
      return cb(hashDate)
    })
  }
  run();
}

// [sttime,edtime,base64file]
function setStringToIPFS(uploadStr, times= 5, cb) {
  console.log("====== uploadStr =======");
  console.log(uploadStr);
  var Datefile = Buffer.from(uploadStr);
  function run() {
    var ipfs = IPFSinit();
    ipfs.files.add(Datefile, function (err, files) {
      console.log(files);
      times -= 1;
      if (err) {
        console.log("files add to ipfs error")
        if (times <= 0) {
          return cb("files add to ipfs error")
        }
        else {
          ipfs = IPFSinit()
          setTimeout(run, 100);
        }
      }
      return cb(files[0].hash)
    })
  }
  run();
}

// get file from ipfs with hash
function getStringFromIPFS(hash, cb) {
  var ipfs = IPFSinit();
  ipfs.pin.ls(function (err, pinset) { //檢查本地端是否有要求的hash檔案
    // console.log("Pinset = ",pinset)
    if (err) {
      console.log("ipfs connect error in hash")
      cb("ipfs connect error in hash")
    }
    else {
      var a = pinset.filter(function (pin) { return pin.hash === hash });
      // console.log("a = ",a)
      if (a.length === 0) {
        // file not found in local pin try to get from other node
        var timeoutProtect = setTimeout(function () {
          // set timer to request other node
          timeoutProtect = null;
          console.log("ipfs get file timeout");
          cb("hash not found")
        }, 3000);

        ipfs.files.get(hash, function (err, files) {
          if (err) {
            console.log("error hash = ", hash)
            clearTimeout(timeoutProtect);
            cb("hash not found")
          }
          else {
            clearTimeout(timeoutProtect);
            files.forEach((file) => {
              var content = file.content.toString();
              cb(content);
             
            })
          }
        })
      }
      else {
        console.log("find in pin");
        ipfs.files.get(hash, function (err, files) {
          if (err) {
            console.log("get file error");
            cb("get file error");
            // throw err;
          }
          files.forEach((file) => {
            var content = file.content.toString();
            cb(content);
          })
        })
      }
    }
  })
}

// get file from ipfs with hash
function getFileFromIPFS(hash, role, cb) {
  var ipfs = IPFSinit();
  ipfs.pin.ls(function (err, pinset) { //檢查本地端是否有要求的hash檔案
    // console.log("Pinset = ",pinset)
    if (err) {
      console.log("ipfs connect error in hash")
      cb("ipfs connect error in hash")
    }
    else {
      var a = pinset.filter(function (pin) { return pin.hash === hash });
      // console.log("a = ",a)
      if (a.length === 0) {
        // file not found in local pin try to get from other node
        var timeoutProtect = setTimeout(function () {
          // set timer to request other node
          timeoutProtect = null;
          console.log("ipfs get file timeout");
          cb("hash not found")
        }, 3000);

        ipfs.files.get(hash, function (err, files) {
          if (err) {
            console.log("error hash = ", hash)
            clearTimeout(timeoutProtect);
            cb("hash not found")
          }
          else {
            clearTimeout(timeoutProtect);
            files.forEach((file) => {
              var content = Buffer.from(file.content, 'base64') // modified

              var st = content.indexOf(',')
              var check = 1
              var ed = content.indexOf(',', st + 1)
              if (st === -1 || ed === -1) {
                check = 0;
                console.log("file got from ipfs is wrong,wrong format");
              }
              if (check === 1) {
                var sttime = parseInt(content.toString().substring(0, st), 10);
                var edtime = parseInt(content.toString().substring(st + 1, ed), 10);
                console.log("sttime = ", sttime, "edtime = ", edtime)
                if ((edtime === sttime || edtime > Date.now()) && role == 1) {  //endtime= 0 or not expired
                  // console.log("pdf content = ",content)
                  ipfs.pin.add(hash, function (err) {
                    if (err) {
                      console.log("file add to local pin error");
                    }
                    else {
                      console.log("file add to local pin");
                    }
                  })

                  content = Buffer.from(content.toString().substring(ed + 1, content.toString().length), 'base64')
                  cb(content);
                }
                else if (role === 0 && (edtime > Date.now() && edtime !== sttime)) {
                  ipfs.pin.add(hash, function (err) {
                    if (err) {
                      console.log("file add to local pin error");
                    }
                    else {
                      console.log("file add to local pin");
                    }
                  })

                  content = Buffer.from(content.toString().substring(ed + 1, content.toString().length), 'base64')
                  cb(content);
                }
                else {
                  cb("file not exist")
                }
              }
              else {
                cb("file got from ipfs is wrong,wrong format");
              }
            })
          }
        })
      }
      else {
        console.log("find in pin");
        ipfs.files.get(hash, function (err, files) {
          if (err) {
            console.log("get file error");
            cb("get file error");
            // throw err;
          }
          files.forEach((file) => {
            var content = Buffer.from(file.content, 'base64')
            var st = content.indexOf(',')
            var check = 1
            var ed = content.indexOf(',', st + 1)
            if (st === -1 || ed === -1) {
              check = 0;
              console.log("file got from ipfs is wrong,wrong format");
              cb("file got from ipfs is wrong,wrong format");
            }
            if (check === 1) {
              var sttime = parseInt(content.toString().substring(0, st), 10);
              var edtime = parseInt(content.toString().substring(st + 1, ed), 10);
              console.log("sttime = ", sttime, "edtime = ", edtime)

              if ((edtime === sttime || edtime > Date.now()) && role === 1) {  //endtime= 0 or not expired
                content = Buffer.from(content.toString().substring(ed + 1, content.toString().length), 'base64')
                cb(content);
              }
              else if (role === 0 && (edtime > Date.now() && edtime !== sttime)) {
                content = Buffer.from(content.toString().substring(ed + 1, content.toString().length), 'base64')
                cb(content);
              }
              else {
                if (edtime < Date.now() && edtime !== sttime) {
                  rmIPFSFile(hash, function (ret) {
                    console.log("successfully unpipnned")
                  })
                }
                cb("file not exist")
              }
            }
          })
        })
      }
    }
  })
}

// delete local file
function rmIPFSFile(hash, cb) {
  var ipfs = IPFSinit();
  console.log("hash = ", hash)
  ipfs.pin.rm(hash, function (err, pinset) {
    if (err) {
      console.log("error in rm ipfs localfile")
    }
    console.log("delete file ", pinset)
  })
  cb("OK");
  // ipfs.pin.ls(hash,function(err,pinset){
  //   console.log("hi!!")
  //   var a = pinset.filter(function(pin){ return pin.hash === hash });
  //   if(a.length !== 0){
  //       ipfs.pin.rm(hash);
  //       cb("file deleted");
  //   }
  //   else{
  //     cb("file not in ipfs");
  //   }
  // })
}

function addRemoteIPFS(hash, cb) {
  var ipfs = IPFSinit();
  console.log("addRemoteIPFS called");
  ipfs.pin.add(hash, function (err) {
    if (err) {
      console.log("file add to local pin error");
    }
    else {
      console.log("file add to local pin");
    }
  })
}

module.exports = {
  UploadtoIPFS: UploadtoIPFS,
  getFileFromIPFS: getFileFromIPFS,
  rmIPFSFile: rmIPFSFile,
  setStringToIPFS: setStringToIPFS,
  getStringFromIPFS: getStringFromIPFS
};
