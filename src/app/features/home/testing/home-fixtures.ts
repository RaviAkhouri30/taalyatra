import { HttpResponse } from '@angular/common/http';
import { type Provider } from '@angular/core';
import { of } from 'rxjs';
import fakeDb from '@core/backends/fake/fake-db.json';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IHomeHeroDto } from '../sections/hero/i-home-hero';
import { type IAudiencesDto } from '../sections/audiences/i-audiences';
import { type IDrumCircleDto } from '../sections/drum-circle/i-drum-circle';
import { type IExperiencesDto } from '../sections/experiences/i-experiences';
import { type IOfferDto } from '../sections/offer/i-offer';
import { type IRhythmGameDto } from '../sections/rhythm-game/i-rhythm-game';
import { type IHomeShowsDto } from '../sections/shows/i-home-shows';
import { type ITrustCardDto } from '../sections/trust/i-trust-card';

/** Home page fixtures for specs, taken from the fake database so tests and app never drift. */
export const HOME = fakeDb.home;
export const HERO_DTO: IHomeHeroDto = HOME.hero;
export const TRUST_DTOS: readonly ITrustCardDto[] = HOME.trust;
export const OFFER_DTO: IOfferDto = HOME.offer;
export const AUDIENCES_DTO: IAudiencesDto = HOME.audiences;
export const EXPERIENCES_DTO: IExperiencesDto = HOME.experiences;
export const SHOWS_DTO: IHomeShowsDto = HOME.shows;
export const DRUM_CIRCLE_DTO: IDrumCircleDto = HOME.drumCircle;
export const RHYTHM_GAME_DTO: IRhythmGameDto = HOME.rhythmGame;
export const VIDEOS = fakeDb.videos;
export const GALLERY = fakeDb.gallery;
export const TEAM = fakeDb.team;
export const SHOW_FORMATS = fakeDb.showFormats;

/** Shared documents every backend answers the same way, whatever body a spec passes. */
const SHARED_BODIES = new Map<string, unknown>([
  [ApiEndpoint.SiteConfig, fakeDb.site.config],
  [ApiEndpoint.ShowFormats, fakeDb.showFormats],
]);

/**
 * @param body Response body every GET returns (`null` simulates an empty response), except
 * the shared documents (`site/config`, `showFormats`), which answer from the fake database like
 * the real backends.
 * @returns A stub `IHttpBackend` provider and its `get` spy.
 */
export function stubBackend(body: unknown): { provider: Provider; get: ReturnType<typeof vi.fn> } {
  const get = vi.fn((path: string) =>
    of(
      new HttpResponse({
        status: 200,
        body: SHARED_BODIES.has(path) ? SHARED_BODIES.get(path) : body,
      }),
    ),
  );
  return { provider: { provide: IHttpBackend, useValue: { get } }, get };
}
