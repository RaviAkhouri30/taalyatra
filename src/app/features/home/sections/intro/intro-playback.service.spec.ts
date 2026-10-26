import { IntroPlaybackService } from './intro-playback.service';

describe('IntroPlaybackService', () => {
  it('should let the intro play only the first time', () => {
    const playback = new IntroPlaybackService();

    expect(playback.claim()).toBe(true);
    expect(playback.claim()).toBe(false);
  });
});
