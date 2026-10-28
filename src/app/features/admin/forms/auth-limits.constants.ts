/** Longest email address allowed (RFC 5321). */
export const EMAIL_MAX_LENGTH = 254;

/** Firebase's minimum password length; shorter passwords can't match any account. */
export const PASSWORD_MIN_LENGTH = 6;

/** Longest password accepted, so absurd input never reaches the server. */
export const PASSWORD_MAX_LENGTH = 128;
