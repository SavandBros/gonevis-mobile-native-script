import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/interfaces/api-response';
import { EntriesResponse } from '@app/interfaces/entries-response';
import { EntryData } from '@app/interfaces/entry-data';
import { ApiResponseModel } from '@app/models/api-response-model';
import { Entry } from '@app/models/entry';
import { ApiService } from '@app/services/api/api.service';
import { BlogService } from '@app/services/blog/blog.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EntriesService {

  constructor(private http: HttpClient,
              private apiService: ApiService) {
  }

  /**
   * Get entries
   *
   * @param isPage Determines whether entries are pages or posts
   * @param status Entries with specific status
   * @param search Search text
   */
  getEntries(isPage: boolean, status: number, search: string): Observable<EntriesResponse> {
    const httpParams: HttpParams = new HttpParams()
      .set('site', BlogService.currentBlog.id)
      .set('is_page', isPage.toString())
      .set('status', status.toString())
      .set('search', search);

    return this.http.get<ApiResponse<EntryData>>(`${this.apiService.base.v1}website/entry/`, {
      params: httpParams,
    }).pipe(
      map((data: ApiResponse<EntryData>): EntriesResponse => {
        const results: Entry[] = [];
        data.results.map((entry: EntryData): void => {
          results.push(new Entry(entry));
        });
        return {
          response: new ApiResponseModel<Entry>(data.count, data.next, data.previous, results),
          status,
        };
      }),
    );
  }

  /**
   * Remove entry
   *
   * @param id Entry ID
   */
  removeEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiService.base.v1}website/entry/${id}/`);
  }
}
