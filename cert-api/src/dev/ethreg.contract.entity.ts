import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EthregContractEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  deployAccount: string;

  @Column({ type: String, nullable: true})
  fooNullNewCol: string | null ;

}