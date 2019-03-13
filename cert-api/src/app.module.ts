import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CertController } from './cert.controller';
import { UtilController } from './util.controller';
import { DatasrcModule } from './datasrc/datasrc.module';
import { AuthModule } from './auth/auth.module';
import { DevModule } from './dev/dev.module';
import { CerttestModule } from './certtest/certtest.module';
import { Connection } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getController } from './ethereum/getblock.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    DatasrcModule,
    AuthModule,
    DevModule,
    CerttestModule,
  ],
  controllers: [AppController, CertController, UtilController, getController],
  components: [],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
