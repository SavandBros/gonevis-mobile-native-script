import { MediaData } from '@app/interfaces/media-data';

export interface UserEntry {
  get_absolute_uri: string;
  name: string;
  username: string;

  media: MediaData;
}
