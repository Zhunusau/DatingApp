import { HttpClient, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { PaginatedResult } from "../_models/pagination";

export function getPaginationHeaders(pageNumber: number, pageSize: number) {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('pageNumber', pageNumber.toString());
    httpParams = httpParams.append('pageSize', pageSize.toString());
    return httpParams;
  }

export function getPaginatedResult<T>(url, params, http: HttpClient) {
    const paginatedResult = new PaginatedResult<T>();
    return http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') !== null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
  }