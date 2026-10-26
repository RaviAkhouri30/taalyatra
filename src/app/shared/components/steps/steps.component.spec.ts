import { TestBed } from '@angular/core/testing';
import { texts } from '@shared/testing/fixtures';
import { StepsComponent } from './steps.component';

describe('StepsComponent', () => {
  it('should render the steps as an ordered list', () => {
    const fixture = TestBed.createComponent(StepsComponent);
    fixture.componentRef.setInput('steps', [
      { number: '01', title: 'Plan', text: 'Tell us.' },
      { number: '02', title: 'Play', text: 'Together.' },
    ]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('ol')).not.toBeNull();
    expect(texts(element, '.num')).toEqual(['01', '02']);
    expect(texts(element, 'h3')).toEqual(['Plan', 'Play']);
  });
});
