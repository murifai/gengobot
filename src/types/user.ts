/**
 * User type for client components
 * Matches the NextAuth session user type
 */
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isAdmin: boolean;
}
