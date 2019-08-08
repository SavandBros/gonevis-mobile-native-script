/**
 * Represents minimal blog structure for user
 */
export interface BlogMinimalUser {
  id: string;
  media: {
    logo: {
      thumbnail_48x48: string
    }
  };
  role: number;
  title: string;
  url: string;
}
