import { TagData } from '@app/interfaces/tag-data';
import { DolphinFile } from '@app/models/dolphin-file';

class TagMedia {
  coverImage: DolphinFile;

  constructor(cover_image: DolphinFile) {
    this.coverImage = cover_image;
  }
}

export class Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  meta_description: string;
  site: string;
  tagged_items_count: number;
  absolute_uri: string;
  media: TagMedia;

  constructor(init: TagData) {
    this.id = init.id;
    this.name = init.name;
    this.slug = init.slug;
    this.description = init.description;
    this.meta_description = init.meta_description;
    this.absolute_uri = init.absolute_uri;
    this.site = init.site;
    this.tagged_items_count = init.tagged_items_count;

    this.media = init.media && init.media.cover_image ? new TagMedia(new DolphinFile(init.media.cover_image)) : null;
  }
}
