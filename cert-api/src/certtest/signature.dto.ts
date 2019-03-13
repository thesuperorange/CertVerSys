export class WalletPwdDTO {    
    password: String;    
    walletPath: string;
  }

export class SignDTO {    
    certList: string[];    
    walletPath: string;
}


    export interface Rsv {
        r: string;
        s: string;
        v: string;
    }

    export interface VerifyDTO {
        signer: string;
        certlist: number[];
        rsv: Rsv[];
    }

