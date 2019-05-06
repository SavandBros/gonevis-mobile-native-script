import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, UserBlog } from '../../models/user/user';
import { ApiService } from '../api/api.service';
import { SecureStorage } from 'nativescript-secure-storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Secure storage instance.
  secureStorage: SecureStorage = new SecureStorage();
  // token subject
  private tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // User subject
  private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public user: Observable<User>;
  // Blog subject
  private blogSubject: BehaviorSubject<UserBlog> = new BehaviorSubject<UserBlog>(null);
  public blog: Observable<UserBlog>;

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {
    console.log(this.apiService.baseApi);
    // If user is authenticated, then store token and user subjects with their secure storage values.
    if (this.isAuth) {
      // Update token subject data.
      this.tokenSubject.next(this.secureStorage.getSync({ key: 'token' }));
      // Update user subject data.
      this.userSubject.next(new User(JSON.parse(this.secureStorage.getSync({ key: 'user' }))));
      // Update blog subject data.
      this.blogSubject.next(new UserBlog(JSON.parse(this.secureStorage.getSync({ key: 'blog' }))));
      // this.secureStorage.setSync({ key: 'blog', value: JSON.stringify(JSON.parse(this.secureStorage.getSync({ key: 'user' })).sites[1]) });
    }
    this.user = this.userSubject.asObservable();
    this.blog = this.blogSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  public get blogValue(): UserBlog {
    return this.blogSubject.value;
  }

  public get tokenValue(): string {
    return this.tokenSubject.value;
  }

  public get isAuth(): boolean {
    return !!this.secureStorage.getSync({ key: 'token' });
  }

  public unAuth(): void {
    // Clear secure storage.
    this.secureStorage.removeAllSync();
    // Clear token subject value.
    this.tokenSubject.next(null);
    // Clear user subject value.
    this.userSubject.next(null);
    // Clear blog subject value.
    this.blogSubject.next(null);
    // Redirect user to login page.
    this.router.navigateByUrl('/login');
  }

  public changeBlog(blog: UserBlog): void {
    this.secureStorage.setSync({ key: 'blog', value: JSON.stringify(blog) });
    this.blogSubject.next(blog);
    this.router.navigate(['/dash', 'posts']);
  }

  login(payload: { username: string, password: string }): Observable<string> {
    return this.http.post(this.apiService.baseApi + 'account/login/', payload)
      .pipe(
        map((data: object): string => {
          // Store JWT into secure storage.
          this.secureStorage.setSync({ key: 'token', value: data['token'] });
          // Store user into secure storage.
          this.secureStorage.setSync({ key: 'user', value: JSON.stringify(data['user']) });
          // Store first blog into secure storage.
          this.secureStorage.setSync({ key: 'blog', value: JSON.stringify(data['user'].sites[0]) });
          // Update token subject data.
          this.tokenSubject.next(data['token']);
          // Update user subject data.
          this.userSubject.next(new User(data['user']));
          // Update blog subject data.
          this.blogSubject.next(this.userValue.sites[0]);
          // Return raw user data.
          return data['user'].username;
        }),
        catchError(this.apiService.handleError)
      );
  }
}
