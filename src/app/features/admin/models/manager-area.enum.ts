/**
 * The owner's areas the owner can give a manager, one switch each (0022). The values are the keys
 * of a role's `areas`, which `firestore.rules` checks.
 */
export enum ManagerArea {
  Leads = 'leads',
  Visits = 'visits',
  Backups = 'backups',
  GoingBack = 'goingBack',
}
