import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IAiService } from '@core/interfaces/i-ai-service';
import { provideEditorTesting } from '../testing/editor-testing';
import { FeaturesPageViewModel } from './features-page.view-model';

describe('FeaturesPageViewModel', () => {
  function titles(aiReady: boolean): string[] {
    TestBed.configureTestingModule({
      providers: [
        ...provideEditorTesting().providers,
        FeaturesPageViewModel,
        {
          provide: IAiService,
          useValue: { status: () => of({ text: aiReady, vision: false }) },
        },
      ],
    });
    const model = TestBed.inject(FeaturesPageViewModel);
    model.init().subscribe();
    return model.data()?.flatMap((group) => group.cards.map((card) => card.title)) ?? [];
  }

  it('should list the features for the signed-in account', () => {
    TestBed.configureTestingModule({
      providers: [...provideEditorTesting().providers, FeaturesPageViewModel],
    });
    const model = TestBed.inject(FeaturesPageViewModel);

    model.init().subscribe();

    expect(model.data()?.map((group) => group.label)).toEqual([
      'Home page',
      'Other pages',
      'Every page',
      'Admin',
    ]);
  });

  it('should list the AI help only once it’s set up (0025)', () => {
    expect(titles(false)).not.toContain('Help writing with AI');
    TestBed.resetTestingModule();

    expect(titles(true)).toEqual(expect.arrayContaining(['Help writing with AI', 'Analyse leads']));
  });
});
