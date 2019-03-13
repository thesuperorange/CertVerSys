import { Component, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoentity } from './certtest.entity';
import { OrgInfoentity } from './certtest.entity';

@Component()
export class UserinfoService {
  constructor(
    @InjectRepository(OrgInfoentity)
    private readonly orgrepository: Repository<OrgInfoentity>,
    @InjectRepository(UserInfoentity)
    private readonly repository: Repository<UserInfoentity>,
  ) {}

  async getUsers(): Promise<UserInfoentity[]> {
    return await this.repository.find();
  }
  //  async findOne(userID: number): Promise<UserInfoentity | null> {
  //    return await this.repository.findOne(userID);
  //  }
  async save(users: UserInfoentity): Promise<UserInfoentity | null> {
    return await this.repository.save(users);
  }
  async createUsers(users: UserInfoentity): Promise<UserInfoentity> {
    console.log('New User inser: ', JSON.stringify(users, null, 4));
    return this.repository.save(users);
  }
  async getOrg(): Promise<OrgInfoentity[]> {
    return await this.orgrepository.find();
  }
  //  async findOrg(OrgID: number): Promise<OrgInfoentity | null> {
  //    return await this.orgrepository.findOne(OrgID);
  //  }
  async saveOrg(users: OrgInfoentity): Promise<OrgInfoentity | null> {
    return await this.orgrepository.save(users);
  }
  async createOrg(users: OrgInfoentity): Promise<OrgInfoentity> {
    console.log('New User inser: ', JSON.stringify(users, null, 4));
    return this.orgrepository.save(users);
  }
}
