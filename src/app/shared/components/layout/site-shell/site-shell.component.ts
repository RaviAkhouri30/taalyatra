import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { FooterComponent } from '@shared/components/layout/footer/footer.component';
import { HeaderComponent } from '@shared/components/layout/header/header.component';
import { MobileActionBarComponent } from '@shared/components/layout/mobile-action-bar/mobile-action-bar.component';
import { PreviewBannerComponent } from '@shared/components/layout/preview-banner/preview-banner.component';
import { PromoBadgeComponent } from '@shared/components/layout/promo-badge/promo-badge.component';
import { ToastHostComponent } from '@shared/components/layout/toast-host/toast-host.component';
import { UtilityBarComponent } from '@shared/components/layout/utility-bar/utility-bar.component';
import { WhatsAppFabComponent } from '@shared/components/layout/whatsapp-fab/whatsapp-fab.component';
import { type IShellState } from '@shared/interfaces/i-shell-state';
import { SiteShellViewModel } from './site-shell.view-model';

/**
 * Page frame around the router outlet: utility bar, header, footer and floating actions, chosen
 * per route layout. Bare routes (admin) get the outlet only.
 */
@Component({
  selector: 'app-site-shell',
  imports: [
    FooterComponent,
    HeaderComponent,
    MobileActionBarComponent,
    PreviewBannerComponent,
    PromoBadgeComponent,
    RouterOutlet,
    ToastHostComponent,
    UtilityBarComponent,
    WhatsAppFabComponent,
  ],
  templateUrl: './site-shell.component.html',
  styleUrl: './site-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SiteShellViewModel],
})
export class SiteShellComponent extends BaseComponent<IShellState> {
  protected override readonly model = inject(SiteShellViewModel);
}
