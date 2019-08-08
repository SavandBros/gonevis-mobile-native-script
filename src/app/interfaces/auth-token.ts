/**
 * Represents parsed authentication token (JTW) structure
 */
export interface AuthToken {
  email: string;
  exp: number;
  orig_iat: number;
  user_id: string;
  username: string;
}
