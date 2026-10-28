import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CopyTextComponent } from '@shared/components/copy-text/copy-text.component';
import { type IContactDetails } from '@shared/interfaces/i-contact-details';
import { type ISiteLabels } from '@shared/interfaces/i-site-config';
import { toMailtoHref, toTelHref } from '@shared/utils/contact-links.util';

/** "Visit us" footer column: map card, business details and a directions link (home page). */
@Component({
  selector: 'app-footer-visit',
  imports: [CopyTextComponent],
  templateUrl: './footer-visit.component.html',
  styleUrl: './footer-visit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterVisitComponent {
  public readonly contact = input.required<IContactDetails>();
  /** Shared labels: "Call us" and the copy-address messages. */
  public readonly labels = input.required<ISiteLabels>();

  protected readonly telHref = computed(() => toTelHref(this.contact().phone));
  protected readonly mailHref = computed(() => toMailtoHref(this.contact().email));
  /** "Call us", or the number itself when no label is stored. */
  protected readonly callText = computed(
    () => this.labels().callUs || this.contact().phone.display,
  );
  /** "Call us, +91 …" so screen readers also hear the number; none when the link shows it. */
  protected readonly callLabel = computed(() =>
    this.labels().callUs ? `${this.labels().callUs}, ${this.contact().phone.display}` : null,
  );
  protected readonly mapLabel = computed(
    () => `Open ${this.contact().businessName} in Google Maps`,
  );
}
