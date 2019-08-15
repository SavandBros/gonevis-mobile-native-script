import { ApiResponseModel } from '@app/models/api-response-model';
import { Entry } from '@app/models/entry';

/**
 * Represents modified entries response
 */
export interface EntriesResponse {
  response: ApiResponseModel<Entry>;
  status: number;
}
