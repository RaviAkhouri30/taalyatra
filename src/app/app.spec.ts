import { FakeVitalsReporter } from '@core/backends/fake/fake-vitals-reporter';
import { IVitalsReporter } from '@core/interfaces/i-vitals-reporter';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideSiteConfig, provideVisibility } from '@shared/testing/fixtures';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: IVitalsReporter, useClass: FakeVitalsReporter },
        provideRouter([]),
        provideSiteConfig(),
        provideVisibility(),
      ],
    }).compileComponents();
  });

  it('should create the root shell', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a main landmark hosting the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const main = (fixture.nativeElement as HTMLElement).querySelector('main#main-content');

    expect(main).not.toBeNull();
    expect(main?.querySelector('router-outlet')).not.toBeNull();
  });
});
