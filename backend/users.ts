import { getDatabase } from "./database.js";
import { getSession } from "./session.js";

export enum Roles {
  Student,
  Admin,
}

export interface User {
  id: string;
  email: number;
  password: string;
  created: number;
  roles: Roles[];
  class?: number;
}

export type UserLike = Partial<User>;

export async function getUser(user: UserLike): Promise<User | false> {
  const database = getDatabase("repa");
  if (!database) return false;
  const users = database.collection<User>("users");
  const foundUser = await users.findOne(user);
  if (!foundUser) return false;
  return foundUser;
}

export async function updateUser(
  user: UserLike,
  updatedUser: UserLike
): Promise<boolean> {
  const database = getDatabase("repa");
  if (!database) return false;
  const users = database.collection<User>("users");
  return (await users.updateOne(user, { $set: updatedUser })).acknowledged;
}

export async function getUserFromToken(token: string): Promise<number | User> {
  const session = await getSession({ token });
  if (!session) return 0;

  const user = await getUser({ id: session.owner });
  if (!user) return 1;

  return user;
}

export async function getUsers(): Promise<User[]> {
  const database = getDatabase("repa");
  if (!database) return [];
  const users = database.collection<User>("users");
  const foundUsers = await users.find({}).toArray();
  if (!foundUsers) return [];
  return foundUsers;
}
