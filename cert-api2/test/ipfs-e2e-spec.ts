let testhash = "QmerdWLA4fPsEwWMKD5bC6XSgdaj26tj99VQAJc5CG9gzs"
    let filepath = "./src/ipfssample/test.pdf"
    let filename = "test.pdf"
  
   test('/datasrc/db/ipfs upload and download ', async () => {
          const encbody = {  
              certfile_path:'./src/ipfssample/enc.pdf',
           }
          const response2 = await PostReq('/cert/encrypt-pdf', encbody);
          console.log("finish encryption")
         var FileData = fs.readFileSync("./src/ipfssample/enc.pdf")
         console.log("FileData = ",FileData)
          var data = {
            expire: '0',
            uploadpdf:FileData, 
            content_type: 'application/pdf'
          }
           await needle.post("http://127.0.0.1:3000/api/v1/datasrc/db/ipfsupload", data, { multipart: true }, function(err, resp, body) {
             console.log("body = ",body)
             ExpectRespError(resp.statusCode, HttpStatus.OK);
             expect(body.split(',')[2]).toBeTruthy();
           });
    });


   test('/datasrc/db/ipfshash/ipfshash POST ', async() => {
     const hashbody = {
       hash:testhash
     }
     const response = await PostReq('/datasrc/db/ipfshash', hashbody);
     ExpectRespError(response, HttpStatus.OK);
     console.log("=================response=================",response.body)
     expect(response.body).toBeTruthy();
     await fs.writeFileSync("./src/ipfssample/tmp.pdf", new Buffer(response.body, 'hex'));
     // decrypt
                // const encbody = {  
                //     certfile_path:'./ipfssample/tmp.pdf'
                //  }
                //  console.log("encbody = ",encbody)
                // const response3 = await PostReq('/cert/decrypt-pdf', encbody);
                // ExpectRespError(response3.statusCode, HttpStatus.OK);
                // var encFile = fs.readFileSync('./ipfssample/tmp.pdf');
                // var origin = fs.readFileSync('./ipfssample/test.pdf');
                //  expect(encFile).toBe(origin);
    });
