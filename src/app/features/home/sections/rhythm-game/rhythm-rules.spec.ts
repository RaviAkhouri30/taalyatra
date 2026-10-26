import { GameMessage, GameMode, GamePhase, GameSpeed } from './rhythm-game.enums';
import { type IGameState, initialGameState } from './rhythm-game.state';
import { evaluateTap, padFrom, rankFor, stepMs } from './rhythm-rules';

const RANKS = [
  { minScore: 100, name: 'Master', next: '' },
  { minScore: 0, name: 'Rookie', next: '' },
];

function inputState(overrides: Partial<IGameState> = {}): IGameState {
  return { ...initialGameState(0), phase: GamePhase.Input, sequence: [0, 2], ...overrides };
}

describe('rhythm rules', () => {
  it('should shorten each step as the pattern grows, down to a floor', () => {
    expect(stepMs(GameSpeed.Chill, 0)).toBe(820);
    expect(stepMs(GameSpeed.Groove, 5)).toBe(550);
    expect(stepMs(GameSpeed.Pro, 20)).toBe(280);
  });

  it('should map randomness to one of the four pads', () => {
    expect(padFrom(0)).toBe(0);
    expect(padFrom(0.999)).toBe(3);
  });

  it('should advance the position on a correct tap mid-pattern', () => {
    expect(evaluateTap(inputState(), 0, 1)).toEqual({ kind: 'progress', position: 1 });
  });

  it('should complete a round with points for length and streak', () => {
    const outcome = evaluateTap(inputState({ position: 1, score: 40, streak: 2 }), 2, 3);

    expect(outcome).toEqual({ kind: 'round', gain: 30, score: 70, streak: 3, sequence: [0, 2, 3] });
  });

  it('should cost a life on a wrong tap, and end the game on the last one', () => {
    expect(evaluateTap(inputState({ lives: 3 }), 1, 0)).toEqual({ kind: 'miss', lives: 2 });
    expect(evaluateTap(inputState({ lives: 1 }), 1, 0)).toEqual({ kind: 'over', level: 2 });
  });

  it('should pick the highest rank reached', () => {
    expect(rankFor(150, RANKS)?.name).toBe('Master');
    expect(rankFor(10, RANKS)?.name).toBe('Rookie');
    expect(rankFor(10, [])).toBeUndefined();
  });

  it('should start idle in challenge mode with full lives', () => {
    const state = initialGameState(42);

    expect(state).toMatchObject({ mode: GameMode.Challenge, best: 42, lives: 3 });
    expect(state.status.key).toBe(GameMessage.Idle);
  });
});
