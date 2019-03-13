import * as jwt from 'jsonwebtoken';
import { Component } from '@nestjs/common';
import { Util } from '../api.common';

@Component()
export class AuthService {
  async createToken(id: number, username: string, roles: string[]) {
    const expiresIn = 60 * 60;
    const algorithm = 'ES256';
    const secretOrKey = Util.loadJwtPrivateKey();
    const user = { id, username, roles };
    const token = jwt.sign(user, secretOrKey, { expiresIn, algorithm });
    return {
      expires_in: expiresIn,
      access_token: token,
    };
  }

  async validateUser(signedUser): Promise<boolean> {
    // put some validation logic here
    // for example query user by id / email / username
    console.log(signedUser);
    return true;
  }
}
