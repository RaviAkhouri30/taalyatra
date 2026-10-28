import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppRoute } from '@shared/enums/app-route.enum';
import { type IBrand } from '@shared/interfaces/i-brand';

/**
 * The admin area's centred card (design `.login` / `.lcard`): logo, heading, lead, the projected
 * form or content, and an optional link back to the website.
 */
@Component({
  selector: 'app-auth-card',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './auth-card.component.html',
  styleUrl: './auth-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCardComponent {
  public readonly brand = input.required<IBrand>();
  public readonly heading = input.required<string>();
  public readonly lead = input('');
  /** Label of the link back to the website; empty hides it. */
  public readonly back = input('');

  protected readonly home = AppRoute.Home;
}
