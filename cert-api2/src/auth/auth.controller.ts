import { Controller, Get, Post, Request, Response, Param, Next, HttpCode, Query, HttpException, HttpStatus, Body, Patch, Delete, RequestMapping } from '@nestjs/common';
import { GetOidc, GetOidcUserinfo, PostOidc, ExpectRespError, } from './auth.accesstoken';
const _: any = require('lodash');

@Controller('auth')

export class AuthController {

    @Post('oid-callback')
    @HttpCode(HttpStatus.OK)
    public async getOidcToken(@Body() body: any, @Response() res: any) {
        //@Query('code') code: string, @Response() res: any
        // TODO
        const redirect_uri = 'https://certproof.nchc.org.tw/oid/test/callback';
        const token_ep = 'https://tc.sso.edu.tw/oidc/v1/token';
        console.log('into API: getOidcToken, para:code: ' + body.code);
        const response = await PostOidc(token_ep, body.code, redirect_uri);
        //const result = response;
        console.log('getOidcToken get response: ' + response);
        //return {response}
        res.status(HttpStatus.OK).json({ req: body, response });
    }

    @Get('oid-eduinfo/:oidcToken')
    public async GetOidc(@Param() params, @Response() res: any) {
        //@Request() req: any
        // TODO
        const redirect_uri = 'https://certproof.nchc.org.tw/oid/test/callback';
        const eduinfo_ep = 'https://tc.sso.edu.tw/cncresource/api/v1/eduinfo';
        console.log('into API: getEduinfo, para:oidcToken: ' + params.oidcToken);
        const response = await GetOidc(eduinfo_ep, params.oidcToken);
        //const result = response;
        console.log('getEduinfo get response: ' + JSON.stringify(response));
        //return {response}
        res.status(HttpStatus.OK).json({ req: params.oidcToken, response });
    }

    @Get('oid-userinfo/:oidcToken')
    public async GetOidcUserinfo(@Param() params, @Response() res: any) {
        //@Request() req: any
        // TODO
        const redirect_uri = 'https://certproof.nchc.org.tw/oid/test/callback';
        const userinfo_ep = 'https://tc.sso.edu.tw/oidc/v1/userinfo';
        console.log('into API: getUserinfo, para:oidcToken: ' + params.oidcToken);
        const response = await GetOidcUserinfo(userinfo_ep, params.oidcToken);
        //const result = response;
        console.log('getUserinfo get response: ' + JSON.stringify(response));
        //return {response}
        res.status(HttpStatus.OK).json({ req: params.oidcToken, response });
    }

    @Post('oid-tcsso-authurl')
    public oidTcssoAuthurl(@Body() body: any, @Response() res: any) {

        const azp = body.azp || 'https://tc.sso.edu.tw/oidc/v1/azp';
        const redirect_uri =
            body.redirect_uri || 'https://certproof.nchc.org.tw/oid/test/callback'; //'http://140.110.18.199/auth/cb.php';
        const scope = body.scope || 'openid+email+profile+eduinfo';
        const response_type = body.response_type || 'code';
        const client_id = 'a1bb36b684b5638076f5cae5414947aa'; //'8f75cda68d848ecce883b1c3090e34cd';
        const state = body.state || _.random(1000000, 9999999);
        const nonce = Buffer.from('nchc-nonc-' + state).toString('base64');
        // tslint:disable-next-line:max-line-length
        const result = `${azp}?scope=${scope}&client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&state=${state}&nonce=${nonce}`;
        res.status(HttpStatus.OK).json({ result });
    }



}