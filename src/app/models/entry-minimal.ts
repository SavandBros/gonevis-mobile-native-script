export class EntryMinimal {
  title: string;
  content: string;
  status: number;
  site: string;

  constructor(title: string, content: string, status: number, site: string) {
    this.title = title;
    this.content = content;
    this.status= status;
    this.site = site;
  }
}
