import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ContactAsideComponent } from './contact-aside/contact-aside.component';
import { type ContactModel } from './contact.model';
import { HomeContactViewModel } from './home-contact.view-model';
import { ProposalFormComponent } from './proposal-form/proposal-form.component';

/** Proposal request (design `#contact`): header, the form, and ways to reach us directly. */
@Component({
  selector: 'app-home-contact',
  imports: [ContactAsideComponent, IconComponent, ProposalFormComponent],
  templateUrl: './home-contact.component.html',
  styleUrl: './home-contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeContactViewModel],
})
export class HomeContactComponent extends BaseComponent<ContactModel> {
  protected override readonly model = inject(HomeContactViewModel);
  protected readonly anchor = PageAnchor.Contact;
  protected readonly checkIcon = IconName.Check;
}
