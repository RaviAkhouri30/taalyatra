/** A phone number in display and dialable (E.164) forms. */
export interface IPhoneNumber {
  /** Human-readable form, e.g. "+91 92842 76168". */
  readonly display: string;
  /** Dialable form without spaces, e.g. "+919284276168". */
  readonly e164: string;
}

/** How to reach and find the business. Editable from the admin "Contact" tab later. */
export interface IContactDetails {
  readonly phone: IPhoneNumber;
  readonly email: string;
  /** Registered business name as shown on maps. */
  readonly businessName: string;
  /** Business name in the local script, with its BCP 47 language tag. */
  readonly localName: { readonly text: string; readonly lang: string };
  /** Short location label for the utility bar, e.g. "Kharadi, Pune". */
  readonly locality: string;
  readonly address: string;
  readonly hours: string;
  readonly plusCode: string;
  readonly mapsUrl: string;
  readonly directionsUrl: string;
}
