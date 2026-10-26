import { timer, tap } from 'rxjs';
import { GameEffects } from './game-effects';
import { NO_PAD } from './rhythm-game.state';

describe('GameEffects', () => {
  const onLit = vi.fn();
  const onPopAdded = vi.fn();
  const onPopExpired = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    [onLit, onPopAdded, onPopExpired].forEach((spy) => spy.mockReset());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function connect(effects: GameEffects) {
    return effects.connect({ onLit, onPopAdded, onPopExpired }).subscribe();
  }

  it('should light a pad, then turn it off after the flash', () => {
    const effects = new GameEffects();
    const subscription = connect(effects);

    effects.flash(2, 180);
    expect(onLit).toHaveBeenLastCalledWith(2);
    vi.advanceTimersByTime(180);
    expect(onLit).toHaveBeenLastCalledWith(NO_PAD);
    subscription.unsubscribe();
  });

  it('should add score pops and expire each on its own timer', () => {
    const effects = new GameEffects();
    const subscription = connect(effects);

    effects.pop(1, '+1');
    effects.pop(3, '+10');
    expect(onPopAdded).toHaveBeenCalledWith({ id: 1, pad: 1, text: '+1' });
    vi.advanceTimersByTime(900);
    expect(onPopExpired.mock.calls).toEqual([[1], [2]]);
    subscription.unsubscribe();
  });

  it('should cancel a running sequence when a new one is scheduled or cancelled', () => {
    const effects = new GameEffects();
    const subscription = connect(effects);
    const first = vi.fn();
    const second = vi.fn();

    effects.schedule(timer(500).pipe(tap(first)));
    effects.schedule(timer(500).pipe(tap(second)));
    vi.advanceTimersByTime(500);
    effects.schedule(timer(500).pipe(tap(first)));
    effects.cancel();
    vi.advanceTimersByTime(500);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
  });
});
