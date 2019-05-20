import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import Entry from '~/app/models/entry/entry';

@Injectable({
  providedIn: 'root'
})
export class WriteService {

  constructor(private http: HttpClient, private apiService: ApiService) {
  }

  retrieve(entryId: string): Observable<Entry> {
    // API call
    return this.http.get<Entry>(this.apiService.baseApi + `website/entry/${entryId}/`)
      .pipe(
        map((data: { [key: string]: any }): Entry => {
          return new Entry(data);
        }),
        catchError(this.apiService.handleError)
      );
  }
}
