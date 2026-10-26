import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { DrumSoundPlayer } from './drum-sound';
import { GamePadsComponent } from './game-pads.component';
import { HomeRhythmGameViewModel } from './home-rhythm-game.view-model';
import { type RhythmGameModel } from './rhythm-game.model';
import { WebAudioDrumSound } from './web-audio-drum-sound';

/**
 * Rhythm game (design `#play`): copy the pattern to climb the ranks, or jam freely and record a
 * loop. Sound comes from the `DrumSoundPlayer` port, provided here with Web Audio synthesis.
 */
@Component({
  selector: 'app-home-rhythm-game',
  imports: [ButtonDirective, GamePadsComponent, RouterLink],
  templateUrl: './home-rhythm-game.component.html',
  styleUrl: './home-rhythm-game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeRhythmGameViewModel, { provide: DrumSoundPlayer, useClass: WebAudioDrumSound }],
})
export class HomeRhythmGameComponent extends BaseComponent<RhythmGameModel> {
  protected override readonly model = inject(HomeRhythmGameViewModel);
  protected readonly anchor = PageAnchor.Play;
  protected readonly contactAnchor = PageAnchor.Contact;
  protected readonly buttonVariant = ButtonVariant;
}
