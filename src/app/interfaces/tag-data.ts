import { File } from '@app/interfaces/file';

/**
 * Represents tag structure
 */
export interface TagData {
  absolute_uri: string;
  description: string;
  id: string;
  media: {
    cover_image: File;
  };
  meta_description: string;
  name: string;
  site: string;
  slug: string;
  tagged_items_count: number;
}
