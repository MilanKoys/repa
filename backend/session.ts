import { nanoid } from "nanoid";
import { getDatabase } from "./database.js";
import { User } from "./users.js";

export interface Session {
  created: number;
  token: string;
  owner: string;
}

export async function createSession(user: User): Promise<false | Session> {
  const database = getDatabase("repa");
  if (!database) return false;
  const sessions = database.collection("sessions");
  const newSession: Session = {
    created: new Date().getTime(),
    token: nanoid(),
    owner: user.id,
  };
  await sessions.insertOne(newSession);
  return newSession;
}

export async function getSession(
  session: Partial<Session>
): Promise<null | Session> {
  const database = getDatabase("repa");
  if (!database) return null;
  const sessions = database.collection<Session>("sessions");
  return await sessions.findOne(session);
}
