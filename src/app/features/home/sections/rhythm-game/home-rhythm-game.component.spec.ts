import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { queryAll, texts } from '@shared/testing/fixtures';
import { RHYTHM_GAME_DTO, stubBackend } from '../../testing/home-fixtures';
import { DrumSoundPlayer } from './drum-sound';
import { HomeRhythmGameComponent } from './home-rhythm-game.component';
import { HomeRhythmGameViewModel } from './home-rhythm-game.view-model';

describe('HomeRhythmGameComponent', () => {
  const play = vi.fn();

  function render(body: unknown) {
    const backend = stubBackend(body);
    TestBed.configureTestingModule({ providers: [provideRouter([]), backend.provider] });
    TestBed.overrideComponent(HomeRhythmGameComponent, {
      set: {
        providers: [HomeRhythmGameViewModel, { provide: DrumSoundPlayer, useValue: { play } }],
      },
    });
    const fixture = TestBed.createComponent(HomeRhythmGameComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const click = (label: string): void => {
      queryAll(element, 'button')
        .find((button) => button.textContent.trim() === label)
        ?.click();
      fixture.detectChanges();
    };
    return { element, click, get: backend.get, fixture };
  }

  it('should render the challenge controls under the #play anchor', () => {
    const { element, get } = render(RHYTHM_GAME_DTO);

    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeRhythmGame);
    expect(element.querySelector('section')?.id).toBe('play');
    expect(texts(element, '.tabs2 button')).toEqual([
      'Challenge',
      'Free jam',
      'Chill',
      'Groove',
      'Pro',
    ]);
    expect(texts(element, '.gstats b')).toEqual(['Level', 'Score', 'Best', 'Streak']);
    expect(queryAll(element, '.heart')).toHaveLength(3);
    expect(element.querySelector('.rank span')?.textContent).toBe('Rookie');
    expect(element.querySelector('.gbtns .btn')?.textContent.trim()).toBe('Start the challenge');
    expect(queryAll(element, '.pad')).toHaveLength(4);
  });

  it('should switch to free jam with recording controls, and play pads', () => {
    const { element, click } = render(RHYTHM_GAME_DTO);

    click('Free jam');
    queryAll(element, '.pad')[2]?.click();

    expect(element.querySelector('.gstats')).toBeNull();
    expect(texts(element, '.gbtns button')).toEqual(['Record', 'Play back', 'Clear']);
    expect(element.querySelector('.tabs2 button.sel')?.getAttribute('aria-pressed')).toBe('true');
    expect(play).toHaveBeenCalledWith(2);
    click('Record');
    expect(texts(element, '.gbtns button')[0]).toBe('Stop recording');
    click('Play back');
    click('Clear');
    expect(element.querySelector('.gmsg')?.textContent).toBe(
      'Cleared. Press Record to start a new loop.',
    );
  });

  it('should offer sharing and booking once a scored game is over', () => {
    const { element, fixture, click } = render(RHYTHM_GAME_DTO);
    const model = fixture.debugElement.injector.get(HomeRhythmGameViewModel);
    vi.spyOn(model, 'canShare').mockReturnValue(true);
    click('Groove');
    click('Start the challenge');

    expect(texts(element, '.gbtns a')).toEqual(['Share my score', 'Book a real circle']);
    expect(element.querySelector('.gbtns a:last-child')?.getAttribute('href')).toBe('/#contact');
    expect(texts(element, '.gbtns .btn')[0]).toBe('Restart');
  });

  it('should render nothing until the copy has loaded', () => {
    expect(render(null).element.querySelector('section')).toBeNull();
  });
});
