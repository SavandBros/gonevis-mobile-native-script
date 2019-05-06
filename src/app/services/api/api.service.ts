import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '~/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public readonly baseApi: string = environment.api;

  constructor() {
  }

  public handleError(error: HttpErrorResponse): Observable<never> {
      // The response body may contain clues as to what went wrong,
    console.error('Backend returned code:', error.status, 'body was: ', error.error);
    // return an observable with a user-facing error message
    return throwError(error.error);
  }
}
