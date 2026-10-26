import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type DrumCircleModel } from './drum-circle.model';
import { FlowSegmentComponent } from './flow-segment.component';
import { HomeDrumCircleViewModel } from './home-drum-circle.view-model';

/**
 * Drum Circle details (design `#drum-circle-details`): spec strip, about and objectives,
 * a photo strip, similar experiences and the session flow.
 */
@Component({
  selector: 'app-home-drum-circle',
  imports: [ButtonDirective, FlowSegmentComponent, NgOptimizedImage, RouterLink],
  templateUrl: './home-drum-circle.component.html',
  styleUrl: './home-drum-circle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeDrumCircleViewModel],
})
export class HomeDrumCircleComponent extends BaseComponent<DrumCircleModel> {
  protected override readonly model = inject(HomeDrumCircleViewModel);
  protected readonly anchor = PageAnchor.DrumCircleDetails;
}
