export { FeatureGroup, type FeatureChange, type IFeature } from './i-feature';
import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import {
  LEADS_PATH,
  MEDIA_PATH,
  PUBLISH_PATH,
  TEAM_ACCESS_PATH,
  VISITS_PATH,
} from './editor-nav.constants';
import { EditorTab } from './editor-tab.enum';
import { FeatureGroup, type IFeature } from './i-feature';
import { HOME_FEATURES } from './home-features.constants';
import { ManagerArea } from './manager-area.enum';

/** Every feature, grouped as the menu is. Each line is checked by `features.constants.spec.ts`. */
export const FEATURES: readonly IFeature[] = [
  ...HOME_FEATURES,
  {
    id: 'achievements',
    group: FeatureGroup.OtherPages,
    icon: IconName.Star,
    title: 'Achievements page',
    description:
      'Your numbers, milestones, awards, press and performances, with a call to action at the end.',
    site: AppRoute.Achievements,
    change: { tab: EditorTab.Achievements },
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
    id: 'seo',
    group: FeatureGroup.EveryPage,
    icon: IconName.ExternalLink,
    title: 'Search and sharing',
    description:
      'Each page’s title and description, for search results, the browser tab and shared links.',
    site: '/',
    change: { tab: EditorTab.Seo },
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
    id: 'leads-analysis',
    group: FeatureGroup.Admin,
    icon: IconName.Sparkle,
    title: 'Analyse leads',
    description:
      'An AI summary of the leads shown: what brings enquiries, what wins, the busy months. Only counts are sent, never names or contact details.',
    change: { page: LEADS_PATH },
    area: ManagerArea.Leads,
    ai: true,
  },
  {
    id: 'ai-writing',
    group: FeatureGroup.Admin,
    icon: IconName.Sparkle,
    title: 'Help writing with AI',
    description:
      'Rewrite a text clearer, shorter, warmer or more formal, fix its spelling, suggest a first version, or describe a photo. Nothing changes until you choose Use it.',
    change: { note: 'AI help, under any text field and beside photo descriptions' },
    ai: true,
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
