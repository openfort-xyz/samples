import { SmartAccount } from "@prisma/client";
import prisma from "./Client";

export class SmartAccountTable {
  public static async creatSmartAccount(
    userId: number,
    playerId: string,
    ethereumAddress: string
  ): Promise<SmartAccount> {
    return await prisma.smartAccount.create({
      data: {
        openfortPlayer: playerId,
        ethereumAddress: ethereumAddress,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  public static async updateSmartAccount(
    userId: number,
    playerId: string,
    smartAccountAddress: string
  ): Promise<SmartAccount> {
    return await prisma.smartAccount.update({
      where: {
        id: userId,
      },
      data: {
        openfortPlayer: playerId,
        ethereumAddress: smartAccountAddress,
      },
    });
  }
}
