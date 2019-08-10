import { ApiResponse } from '@app/interfaces/api-response';

export class ApiResponseModel<T> {
  count: number = 0;
  next: string = '';
  previous: string = '';
  results: T[] = [];

  constructor(init: ApiResponse<T>) {
    this.count = init.count;
    this.next = init.next;
    this.previous = init.previous;
    this.results = init.results;
  }
}
