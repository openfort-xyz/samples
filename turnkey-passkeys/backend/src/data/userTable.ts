import { SmartAccount, User } from "@prisma/client";
import prisma from "./Client";

export class UserTable {
  public static async createUser(email: string): Promise<User> {
    if (!email) {
      throw new Error("expected non-empty email to create user");
    }

    return await prisma.user.create({
      data: {
        email: email,
      },
    });
  }

  public static async findUserByEmail(email: string): Promise<User> {
    return await prisma.user.findUniqueOrThrow({
      where: {
        email: email,
      },
    });
  }

  public static async findUserById(userId: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  public static async findUserBySubOrganizationId(
    subOrganizationId: string
  ): Promise<User> {
    return await prisma.user.findUniqueOrThrow({
      where: {
        subOrganizationId: subOrganizationId,
      },
    });
  }

  turnkeyName(user: User): string {
    return `wallet-user-${user.email}`;
  }

  public static async updateUserTurnkeySubOrganization(
    userId: number,
    subOrganizationId: string
  ): Promise<User> {
    if (!subOrganizationId) {
      throw new Error("cannot update turnkey sub-organization to an empty ID");
    }

    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        subOrganizationId: subOrganizationId,
      },
    });
  }
}

export interface SmartUser extends User {
  createdAt: Date;
  email: string;
  id: number;
  SmartAccount: SmartAccount[];
  subOrganizationId: string | null;
  updatedAt: Date;
}
