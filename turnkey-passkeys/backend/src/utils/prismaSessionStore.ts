import { PrismaClient } from "@prisma/client";
import { Store, SessionData } from "express-session";
import { SESSION_USER_ID_KEY } from "..";

export class PrismaSessionStore extends Store {
  constructor(private prisma: PrismaClient) {
    super();
  }

  async get(
    sid: string,
    callback: (err?: any, session?: SessionData | null) => void
  ): Promise<void> {
    try {

      if(!sid) return callback();
      const session = await this.prisma.session.findUnique({ where: { sid: sid } });
      if (session) {
        callback(null, JSON.parse(session.data));
      } else {
        callback();
      }
    } catch (err) {
      callback(err);
    }
  }

  async set(
    sid: string,
    session: SessionData,
    callback: (err?: any) => void
  ): Promise<void> {
    const expiresAt =
      typeof session.cookie.maxAge === "number"
        ? new Date(Date.now() + session.cookie.maxAge)
        : new Date(Date.now() + 86400 * 1000); // Default to 1 day
    const userId = (session as any)[SESSION_USER_ID_KEY] as number;
    if (!userId) {
      callback("No userId in session");
      return;
    }
    try {
      await this.prisma.session.upsert({
        where: { sid },
        update: { data: JSON.stringify(session), expires: expiresAt },
        create: {
          sid,
          data: JSON.stringify(session),
          expires: expiresAt,
          userID: userId
        },
      });
      callback();
    } catch (err) {
      callback(err);
    }
  }

  async destroy(sid: string, callback: (err?: any) => void): Promise<void> {
    try {
      await this.prisma.session.delete({ where: { sid } });
      callback();
    } catch (err) {
      callback(err);
    }
  }
}
