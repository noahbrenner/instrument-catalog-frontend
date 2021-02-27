import type { IUser } from "#src/types";

interface Resource {
  userId: IUser["sub"];
}

export function canEditOrDelete<T extends Resource>(
  user: IUser,
  resource: T
): boolean {
  const roles = user["http:auth/roles"];

  // Admins can modify any content
  if (Array.isArray(roles) && roles.includes("admin")) {
    return true;
  }

  // Regular users can only modify content they own
  return Boolean(resource.userId.length) && resource.userId === user.sub;
}
