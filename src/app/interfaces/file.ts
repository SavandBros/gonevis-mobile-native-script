/**
 * Represents file structure
 */
export interface File {
  id: string;
  file: string;
  thumbnail_256x256: string;
  thumbnail_128x128: string;
  thumbnail_48x48: string;
  ext: string;
  meta_data: {
    description?: string;
    name: string;
  };
  user: string;
  file_name: string;
  size_human: string;
  is_image: boolean;
  created: Date;
  updated: Date;
}
