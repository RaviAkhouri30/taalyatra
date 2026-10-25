import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LinkKind } from '@shared/enums/link-kind.enum';
import { type IFooterColumn } from '@shared/interfaces/i-footer-column';

/** A titled column of internal and external links in the footer. */
@Component({
  selector: 'app-footer-links',
  imports: [RouterLink],
  templateUrl: './footer-links.component.html',
  styleUrl: './footer-links.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterLinksComponent {
  public readonly column = input.required<IFooterColumn>();

  protected readonly linkKind = LinkKind;
}
