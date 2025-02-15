import { Roles, User } from "./users.js";

export function hasRoles(user: User, roles: Roles[]): boolean {
  let hasRoles = true;
  roles.forEach((role) => {
    if (!user.roles.find((r) => r == role)) {
      hasRoles = false;
    }
  });
  return hasRoles;
}
