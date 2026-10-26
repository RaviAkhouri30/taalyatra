import { Service } from '@angular/core';

/**
 * Remembers whether the intro has played in this visit, so returning to the home page from an
 * inner page does not replay it. Root singleton: the flag lives as long as the app does.
 */
@Service()
export class IntroPlaybackService {
  private played = false;

  /** @returns `true` the first time only; later calls return `false`. */
  public claim(): boolean {
    if (this.played) {
      return false;
    }
    this.played = true;
    return true;
  }
}
