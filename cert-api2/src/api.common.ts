import { readFileSync } from 'fs';
export class Util {
  public static loadKey(filename: string) {
    return readFileSync(filename);
  }

  public static loadJwtPublicKey() {
    return Util.loadKey(process.env.JWT_ES256_PEM_PUBLIC);
  }

  public static loadJwtPrivateKey() {
    return Util.loadKey(process.env.JWT_ES256_PEM_PRIVATE);
  }
}
