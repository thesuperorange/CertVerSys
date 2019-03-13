export class ClaimDTO {
  typeSubject: string;
  typeIssuer: string;
  idSubject: number = 0;
  idIssuer: number = 0;
  contract: string;
  providerUrl: string;
  keyHex: string;
  valueHex: string;
  contentBase64: string;
  contentName: string;
}