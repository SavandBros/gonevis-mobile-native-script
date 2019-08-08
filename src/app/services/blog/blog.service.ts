import { Injectable } from '@angular/core';
import { BlogMinimalUser } from '@app/interfaces/blog-minimal-user';
import { SecureStorage } from 'nativescript-secure-storage';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlogService {

  /**
   * Setup secure storage
   */
  private static secureStorage: SecureStorage = new SecureStorage();

  /**
   * Current blog subject
   */
  private static blogSubject: BehaviorSubject<BlogMinimalUser> = new BehaviorSubject<BlogMinimalUser>(null);

  /**
   * Current blog
   */
  static blog: Observable<BlogMinimalUser> = BlogService.blogSubject.asObservable();

  constructor() {
  }

  /**
   * Update current blog
   *
   * @param blog Blog data
   */
  static set currentBlog(blog: BlogMinimalUser) {
    BlogService.secureStorage.setSync({ key: 'blog', value: JSON.stringify(blog) });
    BlogService.blogSubject.next(blog);
  }

  /**
   * @return Current blog
   */
  static get currentBlog(): BlogMinimalUser {
    return JSON.parse(BlogService.secureStorage.getSync({ key: 'blog' }));
  }
}
