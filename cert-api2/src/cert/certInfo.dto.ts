export class InputCertInfoDTO {
    owners: string[];  //owner address
    issuer: string;  //issuer address
    signer: string[]; //signer address
    signerID:string[];
    contract: string; //org contract
    version: string;
    certID: number;
    userID: string[];
    certName: string;
    revocation: boolean;
    description: string;
    timestamp: String;    
    ownerToCertID: Object;
    ownerToHash: Object;
    certHashList: Object;
    idSubject: number = 0;
    idIssuer: number = 0;
    contractname: string;
    providerUrl: string;
  }

  