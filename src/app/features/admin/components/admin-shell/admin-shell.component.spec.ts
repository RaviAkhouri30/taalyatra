import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import AdminShellComponent from './admin-shell.component';

describe('AdminShellComponent', () => {
  it('should keep the admin area out of search results only while it is open', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const meta = TestBed.inject(Meta);
    const fixture = TestBed.createComponent(AdminShellComponent);

    expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');
    fixture.destroy();
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
