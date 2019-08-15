import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntryData } from '@app/interfaces/entry-data';
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
  getEntry(entryId: string): Observable<EntryData> {
    return this.http.get<EntryData>(`${this.apiService.base.v1}website/entry/${entryId}/`);
  }

  /**
   * Update entry
   *
   * @param entryId Entry ID
   * @param entry Entry data
   */
  updateEntry(entryId: string, entry): Observable<EntryData> {
    return this.http.put<EntryData>(`${this.apiService.base.v1}website/entry/${entryId}/`, entry);
  }
}
