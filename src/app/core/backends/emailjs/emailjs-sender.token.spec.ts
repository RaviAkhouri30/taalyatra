import { TestBed } from '@angular/core/testing';
import { send } from '@emailjs/browser';
import { EMAILJS_SENDER } from './emailjs-sender.token';

describe('EMAILJS_SENDER', () => {
  it('should be the SDK function when nothing overrides it', () => {
    expect(TestBed.inject(EMAILJS_SENDER)).toBe(send);
  });
});
