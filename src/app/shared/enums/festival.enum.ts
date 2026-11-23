/**
 * The offer's festival look (2.16.0): its colours, its badge icon and its animation. Stored as
 * `site/config` `promotion.festival`; `firestore.rules` (`isValidPromotion`) lists the same names.
 */
export enum Festival {
  Diwali = 'diwali',
  Holi = 'holi',
  Navratri = 'navratri',
  GaneshChaturthi = 'ganesh-chaturthi',
  Dussehra = 'dussehra',
  Baisakhi = 'baisakhi',
  Gurpurab = 'gurpurab',
  Christmas = 'christmas',
  Halloween = 'halloween',
  NewYear = 'new-year',
  /** An offer outside a festival: today's colours, the music note, no animation. */
  None = 'none',
}
