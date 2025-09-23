import type { Role, User } from "@prisma/client";

export interface UserMetadata {
  email: string;
  username: string | null;
  role: Role;
  note: string | null;
  updatedAt: Date;
  createdAt: Date;
  isArchived: boolean;
}

export function userToMetadata(user: User): UserMetadata {
  return {
    email: user.email,
    username: user.username,
    role: user.role,
    note: user.note,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
    isArchived: user.isArchived,
  };
}
