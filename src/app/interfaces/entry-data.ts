import { MediaData } from '@app/interfaces/media-data';
import { TagData } from '@app/interfaces/tag-data';
import { UserEntry } from '@app/interfaces/user-entry';

/**
 * Represents entry data structure
 */
export interface EntryData {
  absolute_uri: string;
  active_comment_count: number;
  circles: any[];
  comment_count: number;
  comment_enabled: boolean;
  content: string;
  created: string;
  entrydraft: EntryData;
  excerpt: string;
  featured: boolean;
  format: number;
  hidden_comment_count: number;
  id: string;
  is_page: boolean;
  media: {
    cover_image: MediaData,
  };
  meta_description: string;
  password: string;
  pending_comment_count: number;
  published: string;
  site: string;
  slug: string;
  start_publication: string;
  status: number;
  tags: TagData[];
  title: string;
  updated: string;
  updated_by: UserEntry;
  user: string;
  view_count: number;
  vote_count: number;

  isSelected: boolean;
  loading: boolean;
}
