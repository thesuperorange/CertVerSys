import {
  Controller,
  Post,
  HttpStatus,
  HttpCode,
  Get,
  Request,
  Response,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  GetOidc,
  GetOidcUserinfo,
  PostOidc,
  ExpectRespError,
} from './auth.accesstoken';

const _: any = require('lodash');

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //
  // openid redirect_uri is locked by tc.sso
  // how to serve 'http://140.110.18.199/auth/cb.php' ?
  // http://host_nginx_proxy/auth/cb.php
  // http://inside_api_host/alpha1/auth/oid-cb ?
  //

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

  @Post('jwt-token')
  @HttpCode(HttpStatus.OK)
  public async getToken(@Body() body: any, @Response() res: any) {
    const token = await this.authService.createToken(
      body.id,
      body.username,
      body.roles,
    );
    res.status(HttpStatus.OK).json({ req: body, token });
  }

  @Post('jwt-authorized')
  public async jwtAuthorized(@Body() body: any, @Response() res: any) {
    res.status(HttpStatus.OK).json({ req: body, authorized: true });
  }

  @Get('jwt-whoami')
  public async whoami(@Request() req: any, @Response() res: any) {
    // passport-jwt : Authenticate should set the req.user if successful
    res.status(HttpStatus.OK).json({ user: req.user });
  }

  @Post('oid-tcsso-authurl')
  public oidTcssoAuthurl(@Body() body: any, @Response() res: any) {
    // ref localrun/oid-issuer.js
    // Why openid-client package need ? just for print out authorizationUrl ?
    //
    // https://tc.sso.edu.tw/oidc/v1/azp?
    // redirect_uri=http%3A%2F%2F140.110.18.199%2Fauth%2Fcb.php
    // &scope=openid+email+profile+eduinfo
    // &nonce=Mjk4NzQ1
    // &client_id=8f75cda68d848ecce883b1c3090e34cd
    // &response_type=code
    // &state=298745

    const azp = body.azp || 'https://tc.sso.edu.tw/oidc/v1/azp';
    const redirect_uri =
      body.redirect_uri || 'https://certproof.nchc.org.tw/oid/v1/callback'; //'http://140.110.18.199/auth/cb.php';
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
