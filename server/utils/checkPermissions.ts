import { UnAuthorizedError } from "../errors";

export const checkPersmissions = (
  requestUser: { name: string; role: "admin" | "user"; userId: string },
  resourceUserId: string,
) => {
  // unless user role is admin I wanna through an error
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId) return;
  throw new UnAuthorizedError("Unauthorized action");
};
