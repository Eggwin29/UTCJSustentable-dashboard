export type UserRole = "admin" | "user";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface UpdateProfileAccessInput {
  role: UserRole;
  active: boolean;
}