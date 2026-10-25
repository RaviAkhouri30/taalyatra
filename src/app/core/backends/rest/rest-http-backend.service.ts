import { HttpClient, type HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { type Observable } from 'rxjs';
import { type IHttpBackend } from '@core/interfaces/i-http-backend';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * REST adapter over Angular's `HttpClient`. Requests full responses (`observe: 'response'`) so it
 * honours the same `HttpResponse<T>` contract as every other adapter (ADR-0002).
 */
export class RestHttpBackend implements IHttpBackend {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(APP_ENVIRONMENT).apiBaseUrl;

  public get<T>(path: string): Observable<HttpResponse<T>> {
    return this.http.get<T>(this.url(path), { observe: 'response' });
  }

  public post<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.http.post<T>(this.url(path), body, { observe: 'response' });
  }

  public put<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.http.put<T>(this.url(path), body, { observe: 'response' });
  }

  public patch<T>(path: string, body: unknown): Observable<HttpResponse<T>> {
    return this.http.patch<T>(this.url(path), body, { observe: 'response' });
  }

  public delete<T>(path: string): Observable<HttpResponse<T>> {
    return this.http.delete<T>(this.url(path), { observe: 'response' });
  }

  private url(path: string): string {
    return `${this.baseUrl}/${path}`;
  }
}
