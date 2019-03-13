const needle = require('needle')
var owner =  {
    10108: "0x999"
};
var data = {
    owner: JSON.stringify(owner),
    uploadfile: { 
      file: './testCert/10108.pdf', 
      content_type: 'application/pdf'
    }
  }
  console.log("+++++++++++++++");
    needle.post('http://localhost:3000/api/v1/datasrc/db/uploads', data, { multipart: true }, function(err, resp, body) {
    console.log("+++++++++++++++");
    console.log(err);
    console.log(resp);
    console.log(body);
  });