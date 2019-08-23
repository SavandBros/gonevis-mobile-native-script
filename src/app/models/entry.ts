import { EntryStatuses } from '@app/enums/entrt-statuses';
import { EntryData } from '@app/interfaces/entry-data';
import { TagData } from '@app/interfaces/tag-data';
import { UserEntry } from '@app/interfaces/user-entry';
import { Media } from '@app/models/media';
import { Tag } from '@app/models/tag';


class EntryMedia {
  cover_image: Media;

  constructor(cover_image: Media) {
    this.cover_image = cover_image;
  }
}

class EntryUser {
  get_absolute_uri: string;
  name: string;
  username: string;

  media: Media;

  constructor(init: UserEntry) {
    this.get_absolute_uri = init.get_absolute_uri;
    this.name = init.name;
    this.username = init.username;

    this.media = new Media(init.media);
  }
}

export class Entry {
  absolute_uri: string;
  active_comment_count: number;
  circles: any[];
  comment_count: number;
  comment_enabled: boolean;
  content: string;
  created: Date;
  excerpt: string;
  featured: boolean;
  format: number;
  hidden_comment_count: number;
  id: string;
  is_page: boolean;
  meta_description: string;
  password: string;
  pending_comment_count: number;
  published: Date;
  site: string;
  slug: string;
  start_publication: Date;
  status: number;
  title: string;
  updated: Date;
  user: string;
  view_count: number;
  vote_count: number;

  entrydraft: Entry | null;
  media: EntryMedia;
  updated_by: EntryUser | null;
  tags: Tag[] = [];

  tag_ids: string[] = [];

  constructor(init: EntryData) {
    this.absolute_uri = init.absolute_uri ? init.absolute_uri : null;
    this.active_comment_count = init.active_comment_count;
    this.circles = init.circles;
    this.comment_count = init.comment_count;
    this.comment_enabled = init.comment_enabled;
    this.content = init.content;
    this.created = new Date(init.created);
    this.excerpt = init.excerpt;
    this.featured = init.featured;
    this.format = init.format;
    this.hidden_comment_count = init.hidden_comment_count;
    this.id = init.id;
    this.is_page = init.is_page;
    this.meta_description = init.meta_description;
    this.password = init.password;
    this.pending_comment_count = init.pending_comment_count;
    this.published = new Date(init.published);
    this.site = init.site;
    this.slug = init.slug;
    this.start_publication = new Date(init.start_publication);
    this.status = init.status;
    this.title = init.title;
    this.updated = new Date(init.updated);
    this.user = init.user;
    this.view_count = init.view_count;
    this.vote_count = init.vote_count;
    // // Check if draft
    if (init.entrydraft) {
      this.entrydraft = new Entry(init.entrydraft);
    } else {
      delete this.entrydraft;
    }
    this.media = init.media && init.media.cover_image ? new EntryMedia(new Media(init.media.cover_image)) : null;
    this.updated_by = init.updated_by ? new EntryUser(init.updated_by) : null;

    if (init.tags) {
      init.tags.forEach((tag: TagData): number => this.tags.push(new Tag(tag)));
    }
  }

  /**
   * @return Entry status indicator
   */
  get isDraft(): boolean {
    return this.status === EntryStatuses.DRAFT;
  }
}
