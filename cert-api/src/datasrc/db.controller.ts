import {
  Body,
  Get,
  Post,
  Controller,
  FileInterceptor,
  FilesInterceptor,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { UploadDbDTO } from './uploadDb.dto';
var fs = require('fs')

@Controller('datasrc/db')
export class DsDbController {
  // localhost:3000/alpha1/datasrc/db
  @Get()
  root() {
    const message = 'Hello Cert Api : ' + new Date();
    const time = new Date();
    return { message, time };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('uploadfile', { limits: { fileSize: 1000000 } }), )
  async upload(@UploadedFile() uploadfile: Express.Multer.File, @Body() payload: any, ) {
    // REF https://github.com/mkatrenik/assignar/blob/master/server/src/images/imgur.controller.ts
    // TODO this.fileService.uploadFile({ buffer: file.buffer, ...payload })
    // console.log(payload)
    var possible = "0123456789";
    var certid = "";

    console.log(payload.owner)


      console.log(uploadfile.originalname);
      console.log(uploadfile.size);
 

    // for (var i = 0; i < 8; i++) { 
    //   certid += possible.charAt(Math.floor(Math.random() * possible.length)); 
    // }
    // const certpath = './cert/' + payload.owner + certid + '.pdf';

    // var cert_file_data = new Buffer(uploadfile.buffer).toString('base64');
    // fs.writeFile(certpath, cert_file_data, function (err) {
    //   if (err) {
    //     return console.error(err);
    //   }
    //   console.log("File created!");
    // });
    // return { cert_file_path: certpath };
  }

  @Post('uploads')
  @UseInterceptors(FilesInterceptor('uploadfile', 60, { limits: { fileSize: 1000000 } }), )
  async uploads(@UploadedFiles() uploadfile: Express.Request, @Body() payload: any, ) {
    // REF https://github.com/mkatrenik/assignar/blob/master/server/src/images/imgur.controller.ts
    // TODO this.fileService.uploadFile({ buffer: file.buffer, ...payload })
    console.log(payload.owner);
    var ownerObj = JSON.parse(payload.owner);
    var possible = "0123456789";
    var rexStudentID = new RegExp('^[0-9]+');
    var certidList = {};
    for (let index in uploadfile) {
      console.log(uploadfile[index].originalname);
      console.log(uploadfile[index].size);
      var certID = '';
      var studentID = uploadfile[index].originalname.match(rexStudentID)[0]
      for (var i = 0; i < 8; i++) { 
        certID += possible.charAt(Math.floor(Math.random() * possible.length)); 
      }
      console.log('certID:' + certID);
      const certpath = './cert/' + ownerObj[studentID] + certID + '.pdf';
      certidList[ownerObj[studentID]] = certID;
      console.log(certpath);
      var cert_file_data = new Buffer(uploadfile[index].buffer);
      fs.writeFile(certpath, cert_file_data, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("File created!");
      });
    }
    return certidList;
  }
}
