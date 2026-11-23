import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IconName } from '@shared/enums/icon-name.enum';
import { DashTone } from '../../models/dash-tone.enum';
import { DashCardComponent } from './dash-card.component';

describe('DashCardComponent', () => {
  async function render(options: { badge?: string; urgent?: boolean; fragment?: string } = {}) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DashCardComponent);
    fixture.componentRef.setInput('tone', DashTone.Visitors);
    fixture.componentRef.setInput('icon', IconName.Briefcase);
    fixture.componentRef.setInput('heading', 'Leads');
    fixture.componentRef.setInput('headingId', 'db-leads');
    fixture.componentRef.setInput('link', '/admin/leads');
    fixture.componentRef.setInput('linkText', 'See the leads');
    fixture.componentRef.setInput('badge', options.badge ?? '');
    fixture.componentRef.setInput('urgent', options.urgent ?? false);
    fixture.componentRef.setInput('fragment', options.fragment);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('should be a section named by its heading, coloured by its tone, with its link', async () => {
    const element = await render();

    expect(element.classList.contains('dc--visitors')).toBe(true);
    expect(element.querySelector('section')?.getAttribute('aria-labelledby')).toBe('db-leads');
    expect(element.querySelector('h3#db-leads')?.textContent).toBe('Leads');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/admin/leads');
    expect(element.querySelector('.dc-badge')).toBeNull();
  });

  it('should show its badge and be marked when it asks for something', async () => {
    const element = await render({ badge: '2 new', urgent: true, fragment: 'backups' });

    expect(element.querySelector('.dc-badge')?.textContent).toBe('2 new');
    expect(element.classList.contains('dc--urgent')).toBe(true);
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/admin/leads#backups');
  });
});
