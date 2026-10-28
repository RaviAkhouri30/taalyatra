import { RHYTHM_GAME_DTO } from '../../testing/home-fixtures';
import { GameMessage, GameMode, GamePhase } from './rhythm-game.enums';
import { RhythmGameModel } from './rhythm-game.model';
import { initialGameState } from './rhythm-game.state';

describe('RhythmGameModel', () => {
  const model = new RhythmGameModel(RHYTHM_GAME_DTO);
  const base = initialGameState(0);

  it('should expose labelled modes, speeds and pads', () => {
    expect(model.modes.map((mode) => mode.label)).toEqual(['Challenge', 'Free jam']);
    expect(model.speeds.map((speed) => speed.label)).toEqual(['Chill', 'Groove', 'Pro']);
    expect(model.pads[0]?.ariaLabel).toBe('Drum pad Boom bass');
  });

  it('should fill message placeholders, choosing singular or plural lives', () => {
    expect(model.message({ key: GameMessage.Miss, params: { lives: 1 } })).toBe(
      'Oops! 1 life left. Listen again…',
    );
    expect(model.message({ key: GameMessage.Miss, params: { lives: 2 } })).toBe(
      'Oops! 2 lives left. Listen again…',
    );
    expect(model.message({ key: GameMessage.Saved, params: { count: 4 } })).toBe(
      'Saved 4 beats. Press Play back.',
    );
  });

  it('should congratulate high final scores only', () => {
    expect(model.gameOverMessage(60)).toBe(GameMessage.GreatGame);
    expect(model.gameOverMessage(20)).toBe(GameMessage.TryAgain);
  });

  it('should build a WhatsApp share link with score and rank', () => {
    expect(decodeURIComponent(model.shareUrl(120))).toBe(
      'https://wa.me/?text=I scored 120 (Rhythm Master) on the Taal Yatra rhythm challenge! Can you beat me? taalyatra.in',
    );
  });

  it('should describe the centre display for every phase and mode', () => {
    expect(model.core(base)).toEqual({ top: 'Ready', big: 'Tap', pulse: false });
    expect(model.core({ ...base, phase: GamePhase.Show, sequence: [1, 2] })).toEqual({
      top: 'Listen',
      big: '2',
      pulse: true,
    });
    expect(model.core({ ...base, phase: GamePhase.Input, sequence: [1, 2], position: 1 }).big).toBe(
      '1/2',
    );
    expect(model.core({ ...base, phase: GamePhase.Over, score: 90 }).big).toBe('90');
    expect(model.core({ ...base, mode: GameMode.Jam }).big).toBe('Free');
    expect(model.core({ ...base, mode: GameMode.Jam, recording: true }).big).toBe('REC');
  });
});
