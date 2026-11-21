import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FAKE_AI_ANALYSIS } from '@core/backends/fake/fake-ai.constants';
import { FakeAiService } from '@core/backends/fake/fake-ai.service';
import { IAiService, NO_AI } from '@core/interfaces/i-ai-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { Lead } from '../../models/lead.model';
import { LeadsAnalysisComponent } from './leads-analysis.component';

describe('LeadsAnalysisComponent', () => {
  function render(leads: readonly Lead[], ai: unknown = null) {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } },
        ai
          ? { provide: IAiService, useValue: ai }
          : { provide: IAiService, useClass: FakeAiService },
      ],
    });
    const fixture = TestBed.createComponent(LeadsAnalysisComponent);
    fixture.componentRef.setInput('leads', leads);
    fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should analyse the shown leads and show the answer', async () => {
    const { fixture, element } = render([new Lead('a', {}), new Lead('b', {})]);
    const button = element.querySelector('button');
    expect(button?.textContent.trim()).toBe('Analyse these 2 leads');

    button?.click();
    await new Promise((resolve) => {
      setTimeout(resolve);
    });
    fixture.detectChanges();

    expect(element.querySelector('.la-text')?.textContent).toContain(FAKE_AI_ANALYSIS);
    expect(element.querySelector('.la-when')?.textContent).toContain('from 2 leads');
  });

  it('should word one lead, and do nothing with none', () => {
    expect(
      render([new Lead('a', {})])
        .element.querySelector('button')
        ?.textContent.trim(),
    ).toBe('Analyse this lead');
    TestBed.resetTestingModule();
    expect(render([]).element.querySelector('button')?.disabled).toBe(true);
  });

  it('should show nothing until the help is set up', () => {
    const ai = { status: () => of(NO_AI), write: vi.fn(), analyseLeads: vi.fn() };

    expect(render([new Lead('a', {})], ai).element.querySelector('section')).toBeNull();
  });
});
