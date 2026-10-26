import { HOME } from '../../testing/home-fixtures';
import { type ProposalValue } from './proposal-form';
import { ProposalMessage } from './proposal-message';

describe('ProposalMessage', () => {
  const message = new ProposalMessage(HOME.contact.message);
  const value: ProposalValue = {
    need: 'A workshop or drum circle',
    eventType: 'Corporate team',
    experience: 'Drum Circle',
    groupSize: '20–50',
    date: '',
    name: ' Asha ',
    phone: '9876543210',
    email: '',
    message: 'Terrace venue',
  };

  it('should list only the answers given, then the note', () => {
    expect(message.body(value)).toBe(
      'Hi Taal Yatra! I would like a proposal.\n\n' +
        'Looking for: A workshop or drum circle\n' +
        'Event type: Corporate team\n' +
        'Group size: 20–50\n' +
        'Experience: Drum Circle\n' +
        'Name: Asha\n' +
        'Phone: 9876543210\n' +
        '\nTerrace venue',
    );
  });

  it('should leave the note out when there is none', () => {
    expect(message.body({ ...value, message: ' ' })).not.toContain('Terrace');
  });

  it('should name the experience in the subject when one is chosen', () => {
    expect(message.subject(value)).toBe('Proposal request: Drum Circle');
    expect(message.subject({ ...value, experience: '' })).toBe('Proposal request');
  });

  it('should build the email with trimmed sender details', () => {
    expect(message.email({ ...value, email: ' asha@example.com ' })).toMatchObject({
      fromName: 'Asha',
      phone: '9876543210',
      replyTo: 'asha@example.com',
      subject: 'Proposal request: Drum Circle',
    });
  });
});
