import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/interfaces/api-response';
import { EntriesResponse } from '@app/interfaces/entries-response';
import { Entry } from '@app/interfaces/entry';
import { ApiResponseModel } from '@app/models/api-response-model';
import { ApiService } from '@app/services/api/api.service';
import { BlogService } from '@app/services/blog/blog.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
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

    return this.http.get<ApiResponse<Entry>>(`${this.apiService.base.v1}website/entry/`, { params: httpParams }).pipe(
      map((data: ApiResponse<Entry>): EntriesResponse => {
        return { response: new ApiResponseModel(data), status };
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
