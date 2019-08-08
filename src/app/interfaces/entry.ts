import { File } from '@app/interfaces/file';
import { Media } from '@app/interfaces/media';
import { Tag } from '@app/interfaces/tag';

/**
 * Represents entry data structure
 */
export interface Entry {
  absolute_uri?: string;
  active_comment_count?: number;
  comment_count?: number;
  comment_enabled?: boolean;
  content: string;
  created?: string;
  entrydraft?: Entry;
  excerpt?: string;
  featured?: boolean;
  format?: number;
  hidden_comment_count?: number;
  id?: string;
  is_page?: boolean;
  media?: {
    cover_image: File,
  };
  meta_description?: string;
  password?: string;
  pending_comment_count?: boolean;
  published?: string;
  site?: string;
  slug?: string;
  start_publication?: string;
  status: number;
  tags?: Tag[];
  title: string;
  updated?: string;
  updated_by?: {
    get_absolute_uri: string,
    media: Media,
    name: string,
    username: string,
  };
  user?: string;
  view_count?: number;
  vote_count?: number;

  isSelected?: boolean;
  loading?: boolean;
}
