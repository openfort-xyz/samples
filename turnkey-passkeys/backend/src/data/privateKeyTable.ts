// privateKeyTable.ts

import { PrivateKey, User } from "@prisma/client";
import prisma from "./Client";

export class PrivateKeyTable {
  public static async savePrivateKeyForUser(
    u: User,
    privateKeyId: string,
    address: string
  ): Promise<PrivateKey> {
    return await prisma.privateKey.create({
      data: {
        userID: u.id,
        turnkeyUUID: privateKeyId,
        ethereumAddress: address,
      },
    });
  }

  public static async getPrivateKeyForUser(u: User): Promise<PrivateKey> {
    return await prisma.privateKey.findFirstOrThrow({
      where: {
        userID: u.id,
      },
    });
  }
}
