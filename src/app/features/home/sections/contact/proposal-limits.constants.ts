import { type ProposalField } from './i-contact';

/**
 * Longest value each proposal field accepts. `firestore.rules` enforces the same limits, and the
 * rules tests build their payloads from this constant, so client and server can't drift apart.
 */
export const PROPOSAL_MAX_LENGTH: Readonly<Record<ProposalField, number>> = {
  need: 100,
  eventType: 100,
  experience: 100,
  groupSize: 100,
  date: 100,
  name: 100,
  phone: 20,
  email: 254,
  message: 2000,
};
