import { Component, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EthregContractEntity } from './ethreg.contract.entity';

@Component()
export class EthregContractService {

  constructor(
    @InjectRepository(EthregContractEntity)
    private readonly repository: Repository<EthregContractEntity>) {}

  async getContracts(): Promise<EthregContractEntity[]> {
    return await this.repository.find();
  }

  async createContract(contract: EthregContractEntity): Promise<EthregContractEntity> {
    console.log("New Ethreg Contract: ", JSON.stringify(contract, null, 4));
    return this.repository.save(contract);
  }
}