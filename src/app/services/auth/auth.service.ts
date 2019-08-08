import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse } from '@app/interfaces/auth-response';
import { UserAuth } from '@app/interfaces/user-auth';
import { BlogService } from '@app/services/blog/blog.service';
import { SecureStorage } from 'nativescript-secure-storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Secure storage instance.
  secureStorage: SecureStorage = new SecureStorage();

  /**
   * Authentication user subject
   */
  private userSubject: BehaviorSubject<UserAuth> = new BehaviorSubject<UserAuth>(null);

  /**
   * Authenticated user
   */
  user: Observable<UserAuth>;

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {
    // If user is authenticated, then store token and user subjects with their secure storage values
    if (this.isAuth()) {
      const userData: UserAuth = JSON.parse(this.secureStorage.getSync({ key: 'user' }));
      // Update user subject data
      this.userSubject.next(userData);
      // Set current blog
      if (BlogService.currentBlog) {
        BlogService.currentBlog = BlogService.currentBlog;
      } else {
        BlogService.currentBlog = userData.sites[0];
      }
    }
    this.user = this.userSubject.asObservable();
  }

  /**
   * Set/update authenticated user data
   *
   * @param userData UserSettings data
   */
  setAuthenticatedUser(userData: UserAuth): void {
    this.secureStorage.setSync({ key: 'user', value: JSON.stringify(userData) });
    this.userSubject.next(userData);
  }

  /**
   * @return Is user authenticated or not
   */
  isAuth(): boolean {
    return !!this.secureStorage.getSync({ key: 'token' });
  }

  /**
   * @returns Stored token from secure storage
   */
  getToken(): string | null {
    return this.secureStorage.getSync({ key: 'token' });
  }

  /**
   * Un-authenticate user by cleaning secure storage
   */
  public unAuth(): void {
    // Clear secure storage
    this.secureStorage.removeAllSync();
    // Clear user subject value
    this.userSubject.next(null);
    // Clear current blog
    BlogService.currentBlog = null;
    // Redirect user to login page
    this.router.navigateByUrl('/login');
  }

  /**
   * Sign user in
   *
   * @param username User username
   * @param password User password
   */
  login(username: string, password: string): Observable<string> {
    return this.http.post<AuthResponse>(`${this.apiService.base.v1}account/login/`, { username, password })
      .pipe(
        map((data: AuthResponse): string => {
          // Store JWT into secure storage
          this.secureStorage.setSync({ key: 'token', value: data.token });
          // Update user subject data
          this.setAuthenticatedUser(data.user);
          // Store current blog into local storage
          BlogService.currentBlog = data.user.sites[1];
          // Return user's username
          return data.user.username;
        }),
      );
  }
}
