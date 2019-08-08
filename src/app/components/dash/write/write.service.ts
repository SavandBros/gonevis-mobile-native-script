import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Entry } from '@app/interfaces/entry';
import { Observable } from 'rxjs';
import { ApiService } from '~/app/services/api/api.service';

@Injectable({
  providedIn: 'root',
})
export class WriteService {

  constructor(private http: HttpClient,
              private apiService: ApiService) {
  }

  /**
   * Get entry
   *
   * @param entryId Entry ID
   */
  getEntry(entryId: string): Observable<Entry> {
    return this.http.get<Entry>(`${this.apiService.base.v1}website/entry/${entryId}/`);
  }

  /**
   * Update entry
   *
   * @param entryId Entry ID
   * @param entry Entry data
   */
  updateEntry(entryId: string, entry): Observable<Entry> {
    return this.http.put<Entry>(`${this.apiService.base.v1}website/entry/${entryId}/`, entry);
  }
}
