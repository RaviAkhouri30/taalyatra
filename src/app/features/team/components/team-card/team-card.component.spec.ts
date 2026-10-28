import { TestBed } from '@angular/core/testing';
import { TEAM_FIXTURE, texts } from '@shared/testing/fixtures';
import { TeamCardComponent } from './team-card.component';

describe('TeamCardComponent', () => {
  it('should show the photo, role, name, bio, skills and fun fact', () => {
    const member = TEAM_FIXTURE[0]!;
    const fixture = TestBed.createComponent(TeamCardComponent);
    fixture.componentRef.setInput('member', member);
    fixture.componentRef.setInput('funFactLabel', 'Fun fact:');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('img')?.getAttribute('alt')).toBe(member.photo.alt);
    expect(element.querySelector('.role')?.textContent).toBe(member.role);
    expect(element.querySelector('h3')?.textContent).toBe(member.name);
    expect(texts(element, '.skills li')).toEqual(member.skills);
    expect(element.querySelector('.fun')?.textContent).toBe(`Fun fact: ${member.funFact}`);
  });
});
