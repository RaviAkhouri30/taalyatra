import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { AiErrorKind } from '@core/enums/ai-error-kind.enum';
import { AI_ERROR_MESSAGES, AiError, IAiService } from '@core/interfaces/i-ai-service';
import { CLOCK } from '@core/tokens/clock.token';
import { Lead } from '../models/lead.model';
import { LeadsAnalysisViewModel } from './leads-analysis.view-model';

const LEADS = [new Lead('a', { eventType: 'Corporate', name: 'Asha' }), new Lead('b', {})];

describe('LeadsAnalysisViewModel', () => {
  function setUp(analyse: () => ReturnType<IAiService['analyseLeads']>) {
    const ai = {
      status: () => of({ text: true, vision: false }),
      write: vi.fn(),
      analyseLeads: vi.fn(analyse),
    };
    TestBed.configureTestingModule({
      providers: [
        LeadsAnalysisViewModel,
        { provide: IAiService, useValue: ai },
        { provide: CLOCK, useValue: { now: () => new Date('2026-11-21T10:00:00Z') } },
      ],
    });
    const model = TestBed.inject(LeadsAnalysisViewModel);
    model.init().subscribe();
    return { model, ai };
  }

  it('should send the leads as counts and show the answer with when and how many', () => {
    const { model, ai } = setUp(() => of('• Corporate leads.'));

    model.analyse(LEADS);

    expect(ai.analyseLeads).toHaveBeenCalledWith(expect.objectContaining({ total: 2 }));
    expect(JSON.stringify(ai.analyseLeads.mock.calls)).not.toContain('Asha');
    expect(model.result()).toEqual({
      text: '• Corporate leads.',
      when: '21 Nov 2026, 3:30 pm',
      count: 2,
    });
    expect(model.data()).toEqual({ text: true, vision: false });
  });

  it('should ignore a second click while it analyses', () => {
    const answer = new Subject<string>();
    const { model, ai } = setUp(() => answer);

    model.analyse(LEADS);
    model.analyse(LEADS);

    expect(model.busy()).toBe(true);
    expect(ai.analyseLeads).toHaveBeenCalledTimes(1);
  });

  it('should say what went wrong, and still analyse next time', () => {
    let fail = true;
    const { model } = setUp(() =>
      fail ? throwError(() => new AiError(AiErrorKind.Refused)) : of('ok'),
    );

    model.analyse(LEADS);
    expect(model.error()).toBe(AI_ERROR_MESSAGES[AiErrorKind.Refused]);
    fail = false;
    model.analyse(LEADS);

    expect(model.error()).toBe('');
    expect(model.result()?.text).toBe('ok');
  });
});
