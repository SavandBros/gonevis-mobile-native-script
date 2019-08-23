import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@app/interfaces/api-response';
import { EntryData } from '@app/interfaces/entry-data';
import { TagData } from '@app/interfaces/tag-data';
import { ApiResponseModel } from '@app/models/api-response-model';
import { Tag } from '@app/models/tag';
import { BlogService } from '@app/services/blog/blog.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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


  /**
   * Get tags
   */
  getTags(): Observable<ApiResponseModel<Tag>> {
    const httpParams: HttpParams = new HttpParams()
      .set('site', BlogService.currentBlog.id);

    return this.http.get<ApiResponse<TagData>>(`${this.apiService.base.v1}tagool/tag/`, { params: httpParams }).pipe(
      map((data: ApiResponse<TagData>): ApiResponseModel<Tag> => {
        let results: Tag[] = [];

        data.results.forEach((tag: TagData): number => results.push(new Tag(tag)));
        return new ApiResponseModel<Tag>(data.count, data.next, data.previous, results);
      }),
    );
  }
}
