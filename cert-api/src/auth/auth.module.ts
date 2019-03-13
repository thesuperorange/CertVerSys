import * as passport from 'passport';
import {
  Module,
  NestModule,
  MiddlewaresConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthRoleController } from './authrole.controller';

@Module({
  components: [AuthService, JwtStrategy],
  controllers: [AuthController, AuthRoleController],
})
export class AuthModule implements NestModule {

  public configure(consumer: MiddlewaresConsumer) {
    consumer
      .apply(passport.authenticate('jwt', { session: false }))
       .forRoutes(
         { path: '/auth/jwt-authorized', method: RequestMethod.ALL},
         { path: '/auth/jwt-whoami', method: RequestMethod.ALL},
         { path: '/authrole/*', method: RequestMethod.ALL}
        );
  }
}
