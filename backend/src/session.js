import { nanoid } from "nanoid";
import { getDatabase } from "./database.js";
export async function createSession() {
    const database = getDatabase("repa");
    if (!database)
        return false;
    const sessions = database.collection("sessions");
    const newSession = {
        created: new Date().getTime(),
        token: nanoid(),
    };
    await sessions.insertOne(newSession);
    return newSession;
}
