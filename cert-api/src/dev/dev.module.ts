import { Module } from '@nestjs/common';
import { BobController } from './bob.controller';
import { EthRegController } from './ethreg.controller';
import { EthRegContractController } from './ethreg.contract.controller';
import { EthregContractEntity } from './ethreg.contract.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthregContractService } from './ethreg.contract.service';
import { DidController } from './did.controller';

@Module({
    controllers: [BobController, EthRegController, EthRegContractController, DidController],
    imports: [TypeOrmModule.forFeature([EthregContractEntity])],
    components: [EthregContractService]
})

export class DevModule {}