/** What a dashboard card is about, which sets its colour (0030). */
export enum DashTone {
  /** Changes to put on the website: the theme's accent. */
  Publish = 'publish',
  /** Something to look at: approvals, a backup. */
  Attention = 'attention',
  /** People: leads and visits. */
  Visitors = 'visitors',
  /** The website itself: the offer, what's shown. */
  Site = 'site',
  /** Records and news: history, what's new. */
  Quiet = 'quiet',
}
