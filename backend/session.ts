import { nanoid } from "nanoid";
import { getDatabase } from "./database.js";

export interface Session {
  created: number;
  token: string;
}

export async function createSession(): Promise<false | Session> {
  const database = getDatabase("repa");
  if (!database) return false;
  const sessions = database.collection("sessions");
  const newSession: Session = {
    created: new Date().getTime(),
    token: nanoid(),
  };
  await sessions.insertOne(newSession);
  return newSession;
}
