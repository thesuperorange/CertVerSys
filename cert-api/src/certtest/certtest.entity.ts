import {Entity,Column,PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class UserInfoentity {
    @PrimaryGeneratedColumn()
    userID : number;
    
    @Column()
    studentID: string;

    @Column()
    name: string;

    @Column()
    orgID : number;

    @Column()
    classID : string;

    @Column()
    role : number;

    @Column({ nullable: true })
    address: string;
  }

 @Entity()
 export class OrgInfoentity {
  @PrimaryGeneratedColumn()
  userID : number;

  @Column()
  orgID : number;

  @Column()
  orgName : string;

  @Column({ nullable: true })
  contract : string;
}

@Entity()
 export class DidInfoentity {
  @PrimaryGeneratedColumn()
  userID : number;

  @Column()
    context : string;
    
    @Column()
    didid : string;

    @Column()
    pub1id : string;

    @Column()
    pub1type : string;

    @Column()
    pub1owner: string;

    @Column()
    pub1hex: string;

    @Column()
    pub2id : string;

    @Column()
    pub2type : string;

    @Column()
    pub2owner: string;

    @Column()
    pub2hex: string;

    @Column()
    pub3id : string;

    @Column()
    pub3type : string;

    @Column()
    pub3owner: string;

    @Column()
    pub3hex: string;
}