/** Why a media request failed, independent of the provider. */
export enum MediaErrorKind {
  /** The server wouldn't sign or delete for this session: signed out, expired or not the admin. */
  Refused = 'refused',
  /** The provider refused the file itself, e.g. too large or not an image. */
  Rejected = 'rejected',
  /** The network or a service failed; trying again may work. */
  Unavailable = 'unavailable',
}
