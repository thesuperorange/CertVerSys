import { Controller, Get, Post, Request, Response, Param, Next, HttpStatus, Body } from '@nestjs/common';
@Controller()
export class UsersController {


    @Get('certtest/users')
    getStudentList( @Request() req, @Response() res) {
        const users = ["Bob", "Mary", "Jason", "Amy"];
        res.status(HttpStatus.OK).json(users);
    }
//    @Get('certtest/users/:id')
//   getUser() { }
    @Post('certtest/users')
    getClassListBySchool( @Body() schoolID: string, @Response() res: any) {
        //select unique classID where schoolID=xxx
        //console.log("userID:" + userDTO.userID + 'schoolID:' + userDTO.orgID);
        const classID =["A", "B", "C"];
        res.status(HttpStatus.OK).json(classID)
     }
}