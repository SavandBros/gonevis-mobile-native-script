import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { SecureStorage } from 'nativescript-secure-storage';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {
  secureStorage: SecureStorage = new SecureStorage();

  constructor(private authService: AuthService) {
  }

  intercept(request: HttpRequest<void>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token: string;
    // Get token from token subject.
    token = this.secureStorage.getSync({ key: 'token' });
    // Add authorization header with bearer token if available.
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `JWT ${token}`
        }
      });
    }

    return next.handle(request).pipe(catchError((error: HttpErrorResponse): Observable<never> => {
      // Auto logout if 401 response returned from api
      if (error.status === 401) {
        this.authService.unAuth();
      }
      return throwError(error);
    }));
  }
}
