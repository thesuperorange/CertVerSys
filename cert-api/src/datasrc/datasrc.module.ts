import { Module } from '@nestjs/common';
import { DsDbController } from './db.controller';
import { DsEthController } from './eth.controller';
import { DsIpfsController } from './ipfs.controller';
import { DsSwarmController } from './swarm.controller';

@Module({
  imports: [],
  controllers: [
    DsDbController,
    DsEthController,
    DsIpfsController,
    DsSwarmController,
  ],
  components: [],
})
export class DatasrcModule {}
