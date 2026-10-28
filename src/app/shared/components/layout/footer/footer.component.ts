import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandComponent } from '@shared/components/brand/brand.component';
import { FooterCreditComponent } from '@shared/components/layout/footer-credit/footer-credit.component';
import { FooterLinksComponent } from '@shared/components/layout/footer-links/footer-links.component';
import { FooterVisitComponent } from '@shared/components/layout/footer-visit/footer-visit.component';
import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { FooterVariant } from '@shared/enums/variant.enums';
import { type IFooterColumn } from '@shared/interfaces/i-footer-column';
import { type ILayoutChrome } from '@shared/interfaces/i-layout-chrome';
import { type ISiteConfig } from '@shared/interfaces/i-site-config';
import { toMailtoHref, toTelHref } from '@shared/utils/contact-links.util';
import { externalLink } from '@shared/utils/link.util';

/**
 * Site footer in two layouts: compact (inner pages: pages + contact columns) and full
 * (home page: link columns, "Visit us" details and a back-to-top link).
 */
@Component({
  selector: 'app-footer',
  imports: [
    BrandComponent,
    FooterCreditComponent,
    FooterLinksComponent,
    FooterVisitComponent,
    RouterLink,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  public readonly site = input.required<ISiteConfig>();
  public readonly chrome = input.required<ILayoutChrome>();

  protected readonly isFull = computed(() => this.chrome().footer === FooterVariant.Full);

  /** Compact footer's contact column, built from the editable contact details. */
  protected readonly contactColumn = computed<IFooterColumn>(() => {
    const { email, phone, mapsUrl } = this.site().contact;
    return {
      heading: 'Contact',
      links: [
        externalLink(email, toMailtoHref(email)),
        externalLink(phone.display, toTelHref(phone)),
        externalLink('Google Maps', mapsUrl),
      ],
    };
  });

  protected readonly copyright = computed(() => {
    const { brand, contact, copyrightYear } = this.site();
    return `© ${String(copyrightYear)} ${brand.name} · ${contact.businessName} · ${brand.domain}`;
  });

  protected readonly adminRoute = AppRoute.Admin;
  protected readonly homeRoute = AppRoute.Home;
  protected readonly topAnchor = PageAnchor.Top;
}
