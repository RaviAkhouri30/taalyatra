import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { AiErrorKind } from '@core/enums/ai-error-kind.enum';
import { AiTask } from '@core/enums/ai-task.enum';
import { AI_ERROR_MESSAGES, AiError, IAiService } from '@core/interfaces/i-ai-service';
import { EDITOR_TAB_ROUTE_KEY } from '../models/editor-nav.constants';
import { EditorTab } from '../models/editor-tab.enum';
import { AI_UNDO_MS } from '../models/ai-choices';
import { AiAssistViewModel } from './ai-assist.view-model';

const REQUEST = { task: AiTask.Suggest, label: 'Headline', page: 'Hero' };

describe('AiAssistViewModel', () => {
  function setUp(write: () => ReturnType<IAiService['write']>) {
    const ai = {
      status: () => of({ text: true, vision: false }),
      write: vi.fn(write),
      analyseLeads: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        AiAssistViewModel,
        { provide: IAiService, useValue: ai },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { [EDITOR_TAB_ROUTE_KEY]: EditorTab.Offer } } },
        },
      ],
    });
    const model = TestBed.inject(AiAssistViewModel);
    model.init().subscribe();
    return { model, ai };
  }

  it('should know which help is set up, and the page it’s on', () => {
    const { model } = setUp(() => of('x'));

    expect(model.data()).toEqual({ text: true, vision: false });
    expect(model.page).toBe('Offer');
  });

  it('should show the suggestion, and ask the same way again', () => {
    const { model, ai } = setUp(() => of('A first version.'));

    model.ask(REQUEST);
    expect(model.suggestion()).toBe('A first version.');
    expect(model.busy()).toBe(false);
    model.tryAgain();

    expect(ai.write).toHaveBeenCalledTimes(2);
    expect(ai.write).toHaveBeenLastCalledWith(REQUEST);
  });

  it('should ignore a second click while it writes', () => {
    const answer = new Subject<string>();
    const { model, ai } = setUp(() => answer);

    model.ask(REQUEST);
    expect(model.busy()).toBe(true);
    model.ask(REQUEST);
    answer.next('Done.');
    answer.complete();

    expect(ai.write).toHaveBeenCalledTimes(1);
    expect(model.suggestion()).toBe('Done.');
  });

  it('should say what went wrong, and still answer the next request', () => {
    let fail = true;
    const { model } = setUp(() =>
      fail ? throwError(() => new AiError(AiErrorKind.Limit)) : of('Back.'),
    );

    model.ask(REQUEST);
    expect(model.error()).toBe(AI_ERROR_MESSAGES[AiErrorKind.Limit]);
    expect(model.suggestion()).toBeNull();
    fail = false;
    model.ask(REQUEST);

    expect(model.error()).toBe('');
    expect(model.suggestion()).toBe('Back.');
  });

  it('should dismiss the suggestion, and do nothing on Try again before any request', () => {
    const { model, ai } = setUp(() => of('x'));
    model.tryAgain();
    expect(ai.write).not.toHaveBeenCalled();

    model.ask(REQUEST);
    model.dismiss();

    expect(model.suggestion()).toBeNull();
  });
  describe('Undo (0029)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should keep the owner’s text for Undo once a suggestion is used, then drop it', () => {
      const { model } = setUp(() => of('Shorter.'));
      model.ask(REQUEST);

      model.used('Mine, before.');
      expect(model.undo()).toBe('Mine, before.');
      expect(model.suggestion()).toBeNull();
      vi.advanceTimersByTime(AI_UNDO_MS);

      expect(model.undo()).toBeNull();
    });

    it('should drop Undo when it’s taken', () => {
      const { model } = setUp(() => of('x'));
      model.used('Mine.');

      model.dropUndo();

      expect(model.undo()).toBeNull();
    });

    it('should drop Undo when the owner asks again', () => {
      const { model } = setUp(() => of('x'));
      model.used('Mine.');

      model.ask(REQUEST);

      expect(model.undo()).toBeNull();
    });
  });
});
