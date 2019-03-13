import { HttpStatus } from '@nestjs/common';
import { GetReq, PostReq, ExpectRespError } from './test.common';

describe('Auth API', () => {
  let bobToken = null;
  let aliceToken = null;
  const bobBody = {
    id: 0,
    username: 'bob',
    roles: ['USER'],
  };

  const aliceBody = {
    id: 1,
    username: 'alice',
    roles: ['TEACHER'],
  };

  test('/auth/jwt-token for bob token', async () => {
    const response = await PostReq('/auth/jwt-token', bobBody);
    ExpectRespError(response, HttpStatus.OK);
    const r = response.body;
    expect(r.req.id).toBe(0);
    expect(r.token.access_token).toBeTruthy();
    bobToken = r.token.access_token;
  });

  test('/auth/jwt-token for alice token', async () => {
    const response = await PostReq('/auth/jwt-token', aliceBody);
    ExpectRespError(response, HttpStatus.OK);
    const r = response.body;
    expect(r.token.access_token).toBeTruthy();
    aliceToken = r.token.access_token;
  });

  test('/auth/jwt-authorized without jwt token', async () => {
    const body = {
      id: 1999,
    };
    const response = await PostReq('/auth/jwt-authorized', body);
    ExpectRespError(response, HttpStatus.UNAUTHORIZED);
  });

  test('/auth/jwt-authorized with bob token', async () => {
    const body = {
      id: 2001,
    };
    const response = await PostReq('/auth/jwt-authorized', body, bobToken);
    ExpectRespError(response, HttpStatus.OK);
  });

  test('/auth/jwt-whoami without token', async () => {
    const response = await GetReq('/auth/jwt-whoami');
    ExpectRespError(response, HttpStatus.UNAUTHORIZED);
  });

  test('/auth/jwt-whoami with bob token', async () => {
    const response = await GetReq('/auth/jwt-whoami', bobToken);
    ExpectRespError(response, HttpStatus.OK);
    expect(response.body.user).toMatchObject(bobBody);
  });

  test('/auth/jwt-whoami with alice token', async () => {
    const response = await GetReq('/auth/jwt-whoami', aliceToken);
    ExpectRespError(response, HttpStatus.OK);
    expect(response.body.user).toMatchObject(aliceBody);
  });

  // oidTcssoAuthurl()
  test('/auth/oid-tcsso-authurl', async () => {
    const body1 = {};
    const response = await PostReq('/auth/oid-tcsso-authurl', body1);
    ExpectRespError(response, HttpStatus.OK);
    expect(response.body.result).toMatch('https://tc.sso.edu.tw/oidc/v1/azp');
    expect(response.body.result).toMatch('response_type=code');
    expect(response.body.result).toMatch(
      'redirect_uri=https://certproof.nchc.org.tw/oid/v1/callback',
    );
    const body2 = {
      azp: 'http://localhost:3000/oidc/v1/azp',
      redirect_uri: 'http://localhost:3000/oidc/v1/callback',
    };

    const resp2 = await PostReq('/auth/oid-tcsso-authurl', body2);
    ExpectRespError(resp2, HttpStatus.OK);
    expect(resp2.body.result).toMatch('http://localhost:3000/oidc/v1/azp');
    expect(resp2.body.result).toMatch(
      'redirect_uri=http://localhost:3000/oidc/v1/callback',
    );
  });
});
