import { HttpResponse } from '@angular/common/http';
import { type Provider } from '@angular/core';
import { of } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { type IHomeHeroDto } from '../sections/hero/i-home-hero';
import { type ITrustCardDto } from '../sections/trust/i-trust-card';

/** Home page fixtures for specs, taken from the fake database so tests and app never drift. */
export const HOME = fakeDb.home;
export const HERO_DTO: IHomeHeroDto = HOME.hero;
export const TRUST_DTOS: readonly ITrustCardDto[] = HOME.trust;

/**
 * @param body Response body every GET returns (`null` simulates an empty response).
 * @returns A stub `IHttpBackend` provider and its `get` spy.
 */
export function stubBackend(body: unknown): { provider: Provider; get: ReturnType<typeof vi.fn> } {
  const get = vi.fn(() => of(new HttpResponse({ status: 200, body })));
  return { provider: { provide: IHttpBackend, useValue: { get } }, get };
}
