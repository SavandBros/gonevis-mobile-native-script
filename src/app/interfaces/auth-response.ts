import { UserAuth } from '@app/interfaces/user-auth';

/**
 * Represents authentication response data structure
 */
export interface AuthResponse {
  token: string;
  user: UserAuth;
}
