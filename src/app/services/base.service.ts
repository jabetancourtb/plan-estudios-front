import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseService<T> {

    protected httpClient: HttpClient = inject(HttpClient);

    protected apiUrl: string = "";
    protected resource: string = "";

    constructor() {}

    protected executeGet(path: string, options?: any): Observable<T> {
      if (!path) {
        path = '';
      }

      return this.httpClient.get(this.getFullPath() + path, options).pipe(
        map((res: any) => res)
      );
    }

    protected executePost(path: string, body: any, options: any): Observable<any> {
      if (!path) {
        path = '';
      }

      if (!options) {
        return this.httpClient.post(this.getFullPath() + path, body).pipe(
          map((res: any) => res)
        );
      } 
      else {
        return this.httpClient.post(this.getFullPath() + path, body, options).pipe(
          map((res: any) => res)
        );
      }
    }

    protected executeUpdate(path: string, body: any, options?: any): Observable<any> {
        if (!path) {
          path = '';
        }
 
        return this.httpClient.put(this.getFullPath() + path, body, options).pipe(
          map((res: any) => res)
        );
    }

    protected executeDelete(path: string): Observable<any> {
      if (!path) {
        path = '';
      }

      return this.httpClient.delete(this.getFullPath() + path).pipe(
        map((res: any) => res)
      );
    }

    protected getFullPath() {
      return this.apiUrl + this.resource;
    }

}