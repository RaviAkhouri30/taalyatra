import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import HomePageComponent from './home-page.component';

describe('HomePageComponent', () => {
  it('should compose the home sections in design order', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: IHttpBackend, useValue: { get: () => EMPTY } }],
    });
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(Array.from(element.children).map((child) => child.tagName.toLowerCase())).toEqual([
      'app-home-hero',
      'app-home-marquee',
      'app-home-trust',
    ]);
  });
});
