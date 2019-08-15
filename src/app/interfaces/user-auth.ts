import { BlogMinimalUser } from '@app/interfaces/blog-minimal-user';
import { MediaData } from '@app/interfaces/media-data';
import { UserTour } from '@app/interfaces/user-tour';

/**
 * Represents authenticated user structure
 */
export interface UserAuth {
  email: string;
  get_absolute_uri: string;
  has_verified_email: boolean;
  id: string;
  is_active: boolean;
  media: MediaData;
  name: string;
  receive_email_notification: boolean;
  sites: BlogMinimalUser[];
  tour: UserTour;
  username: string;
}
