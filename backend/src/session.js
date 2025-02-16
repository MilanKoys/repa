import { nanoid } from "nanoid";
import { getDatabase } from "./database.js";
export async function createSession(user) {
    const database = getDatabase("repa");
    if (!database)
        return false;
    const sessions = database.collection("sessions");
    const newSession = {
        created: new Date().getTime(),
        token: nanoid(),
        owner: user.id,
    };
    await sessions.insertOne(newSession);
    return newSession;
}
export async function removeSession(session) {
    const database = getDatabase("repa");
    if (!database)
        return false;
    const sessions = database.collection("sessions");
    return (await sessions.deleteOne(session)).acknowledged;
}
export async function getSession(session) {
    const database = getDatabase("repa");
    if (!database)
        return null;
    const sessions = database.collection("sessions");
    return await sessions.findOne(session);
}
