import { nanoid } from "nanoid";
import { getDatabase } from "./database.js";

export interface Season {
  id: string;
  date: number;
  live: boolean;
}

export async function setSeason(id: string): Promise<boolean> {
  const database = getDatabase("repa");
  if (!database) return false;
  const seasons = database.collection<Season>("seasons");
  if (
    (await seasons.updateOne({ id }, { $set: { live: true } })).acknowledged
  ) {
    await seasons.updateOne(
      { id: { $ne: id }, live: true },
      { $set: { live: false } }
    );
    return true;
  }

  return false;
}

export async function getLiveSeason(): Promise<null | Season> {
  const database = getDatabase("repa");
  if (!database) return null;
  const seasons = database.collection<Season>("seasons");

  return await seasons.findOne({ live: true });
}

export async function getSeason(id: string): Promise<null | Season> {
  const database = getDatabase("repa");
  if (!database) return null;
  const seasons = database.collection<Season>("seasons");

  return await seasons.findOne({ id });
}

export async function removeSeason(id: string): Promise<null | true> {
  const database = getDatabase("repa");
  if (!database) return null;
  const seasons = database.collection<Season>("seasons");

  return (await seasons.deleteOne({ id })).acknowledged ? true : null;
}

export async function createSeason(date: Date): Promise<false | Season> {
  const database = getDatabase("repa");
  if (!database) return false;
  const seasons = database.collection("seasons");

  const newSession: Season = {
    id: nanoid(),
    date: date.getTime(),
    live: false,
  };

  await seasons.insertOne(newSession);
  return newSession;
}
