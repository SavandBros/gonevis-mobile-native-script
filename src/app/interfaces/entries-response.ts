import { ApiResponse } from '@app/interfaces/api-response';
import { Entry } from '@app/interfaces/entry';

/**
 * Represents modified entries response
 */
export interface EntriesResponse {
  response: ApiResponse<Entry>;
  status: number;
}
