import { nanoid } from "nanoid";
import { getDatabase } from "./database.js";
import { User } from "./users.js";
import { getLiveSeason } from "./season.js";

export enum AttendanceStatus {
  New,
  Saved,
  Submited,
  Accepted,
  Rejected,
}

export interface Attendance {
  id: string;
  owner: string;
  week: number;
  content: AttendanceItem[];
  status: AttendanceStatus;
  season: string;
}

export interface AttendanceItem {
  subject: string;
  description: string;
  hours: number;
}

export async function submitAttendance(
  user: User,
  id: string
): Promise<boolean> {
  const database = getDatabase("repa");
  if (!database) return false;
  const attendances = database.collection<Attendance>("attendances");

  const season = await getLiveSeason();
  if (!season) return false;

  return (
    await attendances.updateOne(
      {
        id,
        owner: user.id,
        season: season.id,
        status: { $lte: 1 },
        content: { $not: { $size: 0 } },
      },
      {
        $set: {
          status: AttendanceStatus.Submited,
        },
      }
    )
  ).acknowledged;
}

export async function updateAttendance(
  user: User,
  id: string,
  content: AttendanceItem[]
): Promise<boolean> {
  const database = getDatabase("repa");
  if (!database) return false;
  const attendances = database.collection<Attendance>("attendances");

  const season = await getLiveSeason();
  if (!season) return false;

  return (
    await attendances.updateOne(
      { id, owner: user.id, season: season.id, status: { $lte: 1 } },
      {
        $set: {
          content,
          status:
            content.length > 0 ? AttendanceStatus.Saved : AttendanceStatus.New,
        },
      }
    )
  ).acknowledged;
}

export async function getAttendance(user: User): Promise<Attendance[]> {
  const database = getDatabase("repa");
  if (!database) return [];
  const attendances = database.collection<Attendance>("attendances");
  const liveSeason = await getLiveSeason();
  if (!liveSeason) return [];
  return await attendances
    .find({ owner: user.id, season: liveSeason.id })
    .toArray();
}

export async function createAttendance(
  user: User,
  attendance: Partial<Attendance>
): Promise<false | Attendance> {
  const database = getDatabase("repa");
  if (!database) return false;
  const attendances = database.collection<Attendance>("attendances");

  if (typeof attendance.week !== "number") return false;
  if (!Array.isArray(attendance.content)) return false;

  const season = await getLiveSeason();
  if (!season) return false;

  const found = await attendances.findOne({
    week: attendance.week,
    owner: user.id,
    season: season.id,
  });
  if (found) return found;

  const newAttendance: Attendance = {
    id: nanoid(),
    owner: user.id,
    status: AttendanceStatus.New,
    content: attendance.content,
    week: attendance.week ?? 0,
    season: season.id,
  };

  await attendances.insertOne(newAttendance);
  return newAttendance;
}
