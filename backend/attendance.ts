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
      { id, owner: user.id, season: season.id },
      { $set: { content } }
    )
  ).acknowledged;
}

export async function createAttendance(
  user: User,
  attendance: Partial<Attendance>
): Promise<false | Attendance> {
  const database = getDatabase("repa");
  if (!database) return false;
  const attendances = database.collection("attendances");

  if (!attendance.week) return false;
  if (!attendance.content?.length) return false;

  const season = await getLiveSeason();
  if (!season) return false;

  const newAttendance: Attendance = {
    id: nanoid(),
    owner: user.id,
    status: AttendanceStatus.New,
    content: attendance.content ?? [],
    week: attendance.week ?? 0,
    season: season.id,
  };

  await attendances.insertOne(newAttendance);
  return newAttendance;
}
