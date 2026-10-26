import { TestBed } from '@angular/core/testing';
import { type Subscription } from 'rxjs';
import { LocalStoreService } from '@core/services/local-store.service';
import { NOW } from '@shared/tokens/now.token';
import { RANDOM } from '@shared/tokens/random.token';
import { RHYTHM_GAME_DTO, stubBackend } from '../../testing/home-fixtures';
import { DrumSoundPlayer } from './drum-sound';
import { HomeRhythmGameViewModel } from './home-rhythm-game.view-model';
import { GameMode, GamePhase, GameSpeed } from './rhythm-game.enums';

/** Groove speed, one-beat pattern: 650 ms lead-in + one 606 ms step. */
const FIRST_TURN_MS = 1256;

describe('HomeRhythmGameViewModel', () => {
  const play = vi.fn();
  const storeSet = vi.fn();
  let clock = 0;
  let subscription: Subscription;

  function setUp(best: string | null = null): HomeRhythmGameViewModel {
    vi.useFakeTimers();
    play.mockReset();
    storeSet.mockReset();
    TestBed.configureTestingModule({
      providers: [
        HomeRhythmGameViewModel,
        stubBackend(RHYTHM_GAME_DTO).provider,
        { provide: DrumSoundPlayer, useValue: { play } },
        { provide: LocalStoreService, useValue: { get: () => best, set: storeSet } },
        { provide: RANDOM, useValue: () => 0 }, // every new beat is pad 0
        { provide: NOW, useValue: () => clock },
      ],
    });
    const model = TestBed.inject(HomeRhythmGameViewModel);
    subscription = model.init().subscribe();
    return model;
  }

  afterEach(() => {
    subscription.unsubscribe();
    vi.useRealTimers();
  });

  /** Starts a challenge and waits for the player's first turn. */
  function startAndWait(model: HomeRhythmGameViewModel): void {
    model.start();
    vi.advanceTimersByTime(FIRST_TURN_MS);
  }

  it('should load the copy and the stored best score', () => {
    const model = setUp('30');

    expect(model.message()).toBe('Tap a pad to jam, or start the challenge.');
    expect(model.game().best).toBe(30);
    expect(model.isIdle()).toBe(true);
    expect(model.hearts()).toEqual([true, true, true]);
  });

  it('should ignore an unreadable stored best', () => {
    expect(setUp('not-a-number').game().best).toBe(0);
  });

  it('should play the pattern, then hand over to the player', () => {
    const model = setUp();

    model.start();
    expect(model.game().phase).toBe(GamePhase.Show);
    expect(model.message()).toBe('Listen to the pattern…');
    model.tap(0);
    expect(play).not.toHaveBeenCalled(); // taps are ignored while listening

    vi.advanceTimersByTime(FIRST_TURN_MS);

    expect(play).toHaveBeenCalledWith(0);
    expect(model.game().phase).toBe(GamePhase.Input);
    expect(model.core()?.top).toBe('Your turn');
    expect(model.isIdle()).toBe(false);
  });

  it('should score a completed round, store the best and extend the pattern', () => {
    const model = setUp();
    startAndWait(model);

    model.tap(0);

    expect(model.game()).toMatchObject({ score: 10, best: 10, streak: 1, sequence: [0, 0] });
    expect(model.game().pops).toEqual([{ id: 1, pad: 0, text: '+10' }]);
    expect(storeSet).toHaveBeenCalledWith('ty_best', '10');
    vi.advanceTimersByTime(1000);
    expect(model.message()).toBe('Listen to the pattern…');
  });

  it('should count a correct beat mid-pattern', () => {
    const model = setUp();
    startAndWait(model);
    model.tap(0);
    vi.advanceTimersByTime(1000 + 650 + 2 * 592);

    model.tap(0);

    expect(model.game().position).toBe(1);
    expect(model.game().pops.at(-1)?.text).toBe('+1');
  });

  it('should take a life on a miss and replay the pattern', () => {
    const model = setUp();
    startAndWait(model);

    model.tap(2);

    expect(model.game().lives).toBe(2);
    expect(model.message()).toBe('Oops! 2 lives left. Listen again…');
    expect(model.hearts()).toEqual([true, true, false]);
    vi.advanceTimersByTime(1100);
    expect(model.game().phase).toBe(GamePhase.Show);
  });

  it('should end the game on the last life and offer sharing after scoring', () => {
    const model = setUp();
    startAndWait(model);
    model.tap(0); // +10
    for (let miss = 0; miss < 3; miss++) {
      vi.advanceTimersByTime(3000);
      model.tap(3);
    }

    expect(model.game().phase).toBe(GamePhase.Over);
    expect(model.message()).toBe('The groove takes practice. Try again!');
    expect(model.canShare()).toBe(true);
    expect(model.shareUrl()).toContain('wa.me');
    expect(model.isIdle()).toBe(true);
  });

  it('should change speed and mode, cancelling a running pattern', () => {
    const model = setUp();
    model.setSpeed(GameSpeed.Pro);
    model.start();

    model.setMode(GameMode.Jam);
    vi.advanceTimersByTime(FIRST_TURN_MS);

    expect(model.game().speed).toBe(GameSpeed.Pro);
    expect(model.game().phase).toBe(GamePhase.Idle);
    expect(model.message()).toBe('Free jam: tap the pads, or record a loop.');
    expect(play).not.toHaveBeenCalled();
    model.setMode(GameMode.Challenge);
    expect(model.isChallenge()).toBe(true);
  });

  it('should record a jam loop and play it back with its timing', () => {
    const model = setUp();
    model.setMode(GameMode.Jam);
    model.tap(1);
    expect(play).toHaveBeenCalledWith(1);

    model.toggleRecording();
    expect(model.message()).toBe('Recording… tap the pads!');
    clock = 100;
    model.tap(2);
    clock = 400;
    model.tap(3);
    model.toggleRecording();
    expect(model.message()).toBe('Saved 2 beats. Press Play back.');

    play.mockReset();
    model.playBack();
    expect(model.message()).toBe('Playing your loop…');
    vi.advanceTimersByTime(700);
    expect(play.mock.calls).toEqual([[2], [3]]);
    expect(model.message()).toBe('Loop finished. Play it again or record a new one.');
  });

  it('should explain empty playback and clear the loop', () => {
    const model = setUp();
    model.setMode(GameMode.Jam);

    model.playBack();
    expect(model.message()).toBe('Nothing recorded yet. Press Record first.');
    model.clearRecording();
    expect(model.message()).toBe('Cleared. Press Record to start a new loop.');
  });
});
