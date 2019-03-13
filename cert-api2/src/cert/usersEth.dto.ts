import { OrgInfoentity,UserInfoentity, DidInfoentity } from './certtest.entity';

export class UsersEthDTO {
   // typeSubject: string;
   // typeIssuer: string;
    idSubject: number = 0;
    idIssuer: number = 0;
    contract: string;
    providerUrl: string;
    userInfo: UserInfoentity;

    /*userID : number;
    orgID : number;
    classID : number;
    role : number;
    address: string;*/

}

export class DidEthDTO {
    // typeSubject: string;
    // typeIssuer: string;
     idSubject: number = 0;
     idIssuer: number = 0;
     contract: string;
     providerUrl: string;
     didInfo: DidInfoentity;
 
     /*userID : number;
     orgID : number;
     classID : number;
     role : number;
     address: string;*/
 
 }

export class OrgsEthDTO {
    // typeSubject: string;
    // typeIssuer: string;
     idSubject: number = 0;
     idIssuer: number = 0;
     contract: string;
     providerUrl: string;
     orgInfo: OrgInfoentity;
 
     /*userID : number;
     orgID : number;
     classID : number;
     role : number;
     address: string;*/
 
 }