import { Controller,  Post,  HttpStatus,  HttpCode,  Get,  Request,  Response,
    Body,  Query,  Param, UseInterceptors, FileInterceptor, UploadedFile } from '@nestjs/common';

import { diskStorage } from 'multer'
import { extname } from 'path'

@Controller('dev')
export class devController {
    @Post("upload")
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
        destination: './uploads'
        , filename: (req, file, cb) => {
            // Generating a 32 random chars long string
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
            //Calling the callback passing the random name generated with the original extension name
            cb(null, `${randomName}${extname(file.originalname)}`)
        }
        })
        }))

        async upload( @UploadedFile() file) {
            console.log(file)
        }

}

  