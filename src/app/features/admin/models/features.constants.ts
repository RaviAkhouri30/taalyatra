import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import {
  LEADS_PATH,
  MEDIA_PATH,
  PUBLISH_PATH,
  TEAM_ACCESS_PATH,
  VISITS_PATH,
} from './editor-nav.constants';
import { EditorTab } from './editor-tab.enum';
import { ManagerArea } from './manager-area.enum';

/** The Features page's groups, in order (0020 V18). */
export enum FeatureGroup {
  HomePage = 'Home page',
  EveryPage = 'Every page',
  Admin = 'Admin',
}

/** Where a feature is changed: an editor page the account may have hidden, or another admin page. */
export type FeatureChange =
  { readonly tab: EditorTab } | { readonly page: string } | { readonly note: string };

/** One feature of the website or the admin, as the Features page lists it. */
export interface IFeature {
  readonly id: string;
  readonly group: FeatureGroup;
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
  /** Where to see it on the site, e.g. `/#diwali`; none for admin features. */
  readonly site?: string;
  readonly change: FeatureChange;
  /** One of the owner's own areas (0019 decision 6): not listed for a manager. */
  readonly ownerOnly?: boolean;
  /** An area the owner can give a manager (0022): listed for a manager given it. */
  readonly area?: ManagerArea;
}

const anchor = (target: PageAnchor): string => `/#${target}`;

/** Every feature, grouped as the menu is. Each line is checked by `features.constants.spec.ts`. */
export const FEATURES: readonly IFeature[] = [
  {
    id: 'hero',
    group: FeatureGroup.HomePage,
    icon: IconName.Monitor,
    title: 'Hero',
    description:
      'The first thing visitors see: the headline, the request and WhatsApp buttons, and the audience tags.',
    site: anchor(PageAnchor.Top),
    change: { tab: EditorTab.Hero },
  },
  {
    id: 'offer',
    group: FeatureGroup.HomePage,
    icon: IconName.Sparkle,
    title: 'Festival offer',
    description:
      'A seasonal offer that switches itself on and off on the dates you set, with a badge on every page.',
    site: anchor(PageAnchor.Diwali),
    change: { tab: EditorTab.Offer },
  },
  {
    id: 'audiences',
    group: FeatureGroup.HomePage,
    icon: IconName.Building,
    title: 'Who it’s for',
    description: 'The section about who the sessions are for: teams, families and friends.',
    site: anchor(PageAnchor.ForEveryone),
    change: { tab: EditorTab.Audiences },
  },
  {
    id: 'experiences',
    group: FeatureGroup.HomePage,
    icon: IconName.Star,
    title: 'Experiences',
    description: 'The experience cards, with one featured first.',
    site: anchor(PageAnchor.Experiences),
    change: { tab: EditorTab.Experiences },
  },
  {
    id: 'shows',
    group: FeatureGroup.HomePage,
    icon: IconName.Mic,
    title: 'Shows',
    description: 'The show formats on the home page and their own page, with one in the spotlight.',
    site: anchor(PageAnchor.Shows),
    change: { tab: EditorTab.Shows },
  },
  {
    id: 'drum-circle',
    group: FeatureGroup.HomePage,
    icon: IconName.Djembe,
    title: 'Drum circle',
    description: 'What a drum circle is, what it’s for and the occasions it suits, with a picture.',
    site: anchor(PageAnchor.DrumCircleDetails),
    change: { tab: EditorTab.DrumCircle },
  },
  {
    id: 'rhythm-game',
    group: FeatureGroup.HomePage,
    icon: IconName.Pulse,
    title: 'Rhythm game',
    description: 'A small game visitors can play on the home page.',
    site: anchor(PageAnchor.Play),
    change: { tab: EditorTab.RhythmGame },
  },
  {
    id: 'videos',
    group: FeatureGroup.HomePage,
    icon: IconName.Video,
    title: 'Videos',
    description: 'YouTube videos on the home page and their own page, filtered by category.',
    site: anchor(PageAnchor.Watch),
    change: { tab: EditorTab.Videos },
  },
  {
    id: 'gallery',
    group: FeatureGroup.HomePage,
    icon: IconName.Image,
    title: 'Photo gallery',
    description: 'Photos that open full size in a lightbox.',
    site: anchor(PageAnchor.Gallery),
    change: { tab: EditorTab.Gallery },
  },
  {
    id: 'team',
    group: FeatureGroup.HomePage,
    icon: IconName.Group,
    title: 'Team',
    description: 'The team members on the home page and their own page.',
    site: anchor(PageAnchor.Team),
    change: { tab: EditorTab.Team },
  },
  {
    id: 'proposal-form',
    group: FeatureGroup.HomePage,
    icon: IconName.Mail,
    title: 'Proposal form',
    description: 'Visitors ask for a proposal; it’s emailed to you and kept in Leads.',
    site: anchor(PageAnchor.Contact),
    change: { tab: EditorTab.ProposalForm },
  },
  {
    id: 'whatsapp-call',
    group: FeatureGroup.EveryPage,
    icon: IconName.WhatsApp,
    title: 'WhatsApp and Call buttons',
    description: 'Floating buttons on every page that open WhatsApp or call your number.',
    site: '/',
    change: { tab: EditorTab.Contact },
  },
  {
    id: 'assistant',
    group: FeatureGroup.EveryPage,
    icon: IconName.ChatBubble,
    title: 'Chat assistant',
    description: 'Answers common questions and points visitors to a proposal or WhatsApp.',
    site: '/',
    change: { tab: EditorTab.Visibility },
  },
  {
    id: 'business',
    group: FeatureGroup.EveryPage,
    icon: IconName.Document,
    title: 'Business details',
    description:
      'Your business name, tagline and description, in the header, the footer and search results.',
    site: '/',
    change: { tab: EditorTab.Business },
  },
  {
    id: 'visibility',
    group: FeatureGroup.EveryPage,
    icon: IconName.Toggle,
    title: 'Show or hide parts of the site',
    description: 'Switch home sections, whole pages and the buttons on every page on or off.',
    site: '/',
    change: { tab: EditorTab.Visibility },
  },
  {
    id: 'theme',
    group: FeatureGroup.EveryPage,
    icon: IconName.Sparkle,
    title: 'Theme',
    description:
      'The colours, background, text size and fonts of every page, from a ready-made theme or your own, checked so text stays readable.',
    site: '/',
    change: { tab: EditorTab.Theme },
  },
  {
    id: 'drafts',
    group: FeatureGroup.Admin,
    icon: IconName.Send,
    title: 'Drafts, preview and publishing',
    description:
      'Changes save as a draft by themselves; the preview shows them; publishing puts them live.',
    change: { page: PUBLISH_PATH },
  },
  {
    id: 'approvals',
    group: FeatureGroup.Admin,
    icon: IconName.Check,
    title: 'Approvals',
    description:
      'Managers send changes for the owner’s approval, who approves them or sends them back with a reason.',
    change: { page: PUBLISH_PATH },
  },
  {
    id: 'photo-library',
    group: FeatureGroup.Admin,
    icon: IconName.Folder,
    title: 'Photo library',
    description: 'Upload photos, describe them for screen readers, and see where each one is used.',
    change: { page: MEDIA_PATH },
  },
  {
    id: 'find',
    group: FeatureGroup.Admin,
    icon: IconName.Expand,
    title: 'Find',
    description: 'Type a word to jump straight to the field that holds it.',
    change: { note: 'In the Find box at the top of the menu' },
  },
  {
    id: 'history',
    group: FeatureGroup.Admin,
    icon: IconName.Clock,
    title: 'History and going back',
    description: 'The last 20 publishes, who made them, and going back to before any of them.',
    change: { page: PUBLISH_PATH },
    area: ManagerArea.GoingBack,
  },
  {
    id: 'backups',
    group: FeatureGroup.Admin,
    icon: IconName.Copy,
    title: 'Backups',
    description: 'Download the website’s content to keep, and restore it into a draft.',
    change: { page: PUBLISH_PATH },
    area: ManagerArea.Backups,
  },
  {
    id: 'leads',
    group: FeatureGroup.Admin,
    icon: IconName.Briefcase,
    title: 'Leads',
    description: 'Every proposal from the website, to follow up, mark and export.',
    change: { page: LEADS_PATH },
    area: ManagerArea.Leads,
  },
  {
    id: 'visits',
    group: FeatureGroup.Admin,
    icon: IconName.ArrowUpRight,
    title: 'Visits',
    description:
      'Anonymous visits to the site by day, week, month or year, and where visitors arrive.',
    change: { page: VISITS_PATH },
    area: ManagerArea.Visits,
  },
  {
    id: 'team-access',
    group: FeatureGroup.Admin,
    icon: IconName.Lock,
    title: 'Team access',
    description: 'Add managers, and choose what each one may change.',
    change: { page: TEAM_ACCESS_PATH },
    ownerOnly: true,
  },
];
