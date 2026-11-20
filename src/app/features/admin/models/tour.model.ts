import { AppRoute } from '@shared/enums/app-route.enum';
import { EDITOR_TABS } from '../schemas/editor-tabs';
import { type Permissions } from './permissions.model';
import { TOUR_SEEN_KEY_PREFIX } from './tour.constants';
import { ManagerArea } from './manager-area.enum';
import { AREA_ROWS, type IAreaRow } from './team-access.model';

/** The areas a step can point at; each is marked with `appTourTarget` where it's drawn. */
export enum TourTarget {
  Menu = 'menu',
  Find = 'find',
  Cards = 'cards',
  Preview = 'preview',
  PublishBar = 'publish-bar',
  Review = 'review',
  OwnerPages = 'owner-pages',
  Help = 'help',
}

/** The page a step is on: the dashboard, or the first editor page the account can see. */
export enum TourPage {
  Dashboard = 'dashboard',
  FirstTab = 'first-tab',
}

/** One step as written: what it shows, where, and to whom. */
interface ITourStepSource {
  readonly id: string;
  /** The area it highlights; `null` for a step with nothing to point at. */
  readonly target: TourTarget | null;
  readonly page: TourPage;
  readonly title: string;
  readonly text: string;
  /** What a manager reads instead, when it differs. */
  readonly managerText?: string;
  /** The owner's tour has it, and a manager's when given any of the owner's areas (0022). */
  readonly areas?: boolean;
  /** Its area is in the menu, which is a drawer on phones and tablets. */
  readonly inMenu?: boolean;
}

/** One step of an account's tour, ready to show. */
export interface ITourStep {
  readonly id: string;
  readonly target: TourTarget | null;
  /** The address to open before showing it. */
  readonly url: string;
  readonly title: string;
  readonly text: string;
  readonly inMenu: boolean;
}

const STEPS: readonly ITourStepSource[] = [
  {
    id: 'welcome',
    target: null,
    page: TourPage.Dashboard,
    title: 'Welcome to the admin',
    text: 'Here you change the website’s words, photos and settings. Nothing goes live until it’s published, so look around freely.',
  },
  {
    id: 'menu',
    target: TourTarget.Menu,
    page: TourPage.Dashboard,
    title: 'Every page, in one menu',
    text: 'The pages are grouped the way they appear on the site. You see only the ones your account can change.',
    inMenu: true,
  },
  {
    id: 'find',
    target: TourTarget.Find,
    page: TourPage.Dashboard,
    title: 'Find anything',
    text: 'Type a word, like “phone” or “Diwali”, to jump straight to the field that holds it.',
    inMenu: true,
  },
  {
    id: 'cards',
    target: TourTarget.Cards,
    page: TourPage.FirstTab,
    title: 'Cards change the site',
    text: 'Each card changes one part of the page. Changes save as a draft by themselves while you type.',
  },
  {
    id: 'preview',
    target: TourTarget.Preview,
    page: TourPage.FirstTab,
    title: 'See it before anyone else',
    text: 'The preview shows the site as it will look with your draft, and follows the card you’re editing. On a phone, press Show preview.',
  },
  {
    id: 'publish-bar',
    target: TourTarget.PublishBar,
    page: TourPage.FirstTab,
    title: 'Publish or undo',
    text: 'Publish your changes when they’re ready, or undo them. Visitors see them on their next visit.',
    managerText:
      'Publish your changes on pages you may publish, or undo them. Changes that need approval are sent from Review & publish.',
  },
  {
    id: 'review',
    target: TourTarget.Review,
    page: TourPage.Dashboard,
    title: 'Review & publish',
    text: 'Every change with who made it, the changes waiting for your approval, the history to go back to, and backups.',
    managerText:
      'Every change with who made it. Send yours for approval here, with a note, and follow your requests.',
    inMenu: true,
  },
  {
    id: 'owner-pages',
    target: TourTarget.OwnerPages,
    page: TourPage.Dashboard,
    title: 'Only yours',
    text: 'Leads from the proposal form, visits to the site, and Team access, where you decide what each manager may change.',
    areas: true,
    inMenu: true,
  },
  {
    id: 'help',
    target: TourTarget.Help,
    page: TourPage.Dashboard,
    title: 'Help is always here',
    text: 'Take this tour again, see every feature of the site and where it’s changed, or read what’s new.',
  },
];

/**
 * @param permissions The signed-in account.
 * @returns The first editor page it can see, or `null` when it sees none.
 */
export function firstTabUrl(permissions: Permissions): string | null {
  const tab = EDITOR_TABS.find((entry) => permissions.canSee(entry.tab));
  return tab ? `${AppRoute.Admin}/${tab.tab}` : null;
}

/** @returns The owner's areas a manager was given, in Team access's order. */
function givenAreas(permissions: Permissions): readonly IAreaRow[] {
  return AREA_ROWS.filter((row) => permissions.isManager && permissions.canUse(row.area));
}

/**
 * The owner's areas step, for a manager given some of them (0022 design decision 3). It points at
 * them in the menu when one has a link there (Leads, Visits); Backups and Going back are on Review
 * & publish.
 */
function givenStep(step: ITourStepSource, url: string, given: readonly IAreaRow[]): ITourStep {
  const inMenu = given.some((row) => MENU_AREAS.has(row.area));
  return {
    id: step.id,
    target: inMenu ? step.target : null,
    url,
    title: 'Given to you',
    text: `The owner gave you ${given.map((row) => row.label).join(', ')}. Leads and Visits are in the menu; Backups and going back are on Review & publish.`,
    inMenu,
  };
}

/** The owner's areas with their own page in the menu. */
const MENU_AREAS: ReadonlySet<ManagerArea> = new Set([ManagerArea.Leads, ManagerArea.Visits]);

/**
 * @param permissions The signed-in account.
 * @returns Its tour: the owner's has every step; a manager's leaves out the owner's areas, and
 *   the editor-page steps when they can see no page.
 */
export function tourSteps(permissions: Permissions): ITourStep[] {
  const firstTab = firstTabUrl(permissions);
  const given = givenAreas(permissions);
  return STEPS.flatMap((step) => {
    const url = step.page === TourPage.Dashboard ? AppRoute.Admin : firstTab;
    if (url === null) {
      return [];
    }
    if (step.areas === true && !permissions.isOwner) {
      return given.length > 0 ? [givenStep(step, url, given)] : [];
    }
    return [shownStep(step, url, permissions.isOwner)];
  });
}

/** A step as the account reads it: a manager gets its manager text, when it has one. */
function shownStep(step: ITourStepSource, url: string, owner: boolean): ITourStep {
  return {
    id: step.id,
    target: step.target,
    url,
    title: step.title,
    text: owner ? step.text : (step.managerText ?? step.text),
    inMenu: step.inMenu ?? false,
  };
}

/**
 * @param uid An account's id.
 * @returns Where this device remembers that account's answer to the offer.
 */
export function tourSeenKey(uid: string): string {
  return `${TOUR_SEEN_KEY_PREFIX}${uid}`;
}
