export type UserRole = 'user' | 'admin' | null;

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
