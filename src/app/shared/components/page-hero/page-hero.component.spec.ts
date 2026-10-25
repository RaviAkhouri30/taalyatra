import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HeroLeadGap } from '@shared/enums/hero-lead-gap.enum';
import { PageHeroComponent } from './page-hero.component';

@Component({
  imports: [PageHeroComponent],
  template: `<app-page-hero
    eyebrow="Our team"
    title="The people behind"
    highlight="the beat."
    lead="Facilitators."
    [leadGap]="gap"
    ><button type="button">Act</button></app-page-hero
  >`,
})
class HostComponent {
  public gap = HeroLeadGap.Relaxed;
}

describe('PageHeroComponent', () => {
  it('should render eyebrow, title with highlight, relaxed lead and projected content', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.eyebrow')?.textContent).toBe('Our team');
    expect(element.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim()).toBe(
      'The people behind the beat.',
    );
    expect(element.querySelector('.lead')?.classList).toContain('lead--relaxed');
    expect(element.querySelector('button')?.textContent).toBe('Act');
  });

  it('should omit the highlight and lead when not given', () => {
    const fixture = TestBed.createComponent(PageHeroComponent);
    fixture.componentRef.setInput('eyebrow', 'Videos');
    fixture.componentRef.setInput('title', 'Watch');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.hl')).toBeNull();
    expect(element.querySelector('.lead')).toBeNull();
  });
});
