import { TestBed } from '@angular/core/testing';
import { queryAll } from '@shared/testing/fixtures';
import { RHYTHM_GAME_DTO } from '../../testing/home-fixtures';
import { GamePadsComponent } from './game-pads.component';
import { RhythmGameModel } from './rhythm-game.model';

describe('GamePadsComponent', () => {
  it('should render the pads, lit state, centre display and pops, and emit taps', () => {
    const fixture = TestBed.createComponent(GamePadsComponent);
    fixture.componentRef.setInput('pads', new RhythmGameModel(RHYTHM_GAME_DTO).pads);
    fixture.componentRef.setInput('lit', 2);
    fixture.componentRef.setInput('core', { top: 'Listen', big: '3', pulse: true });
    fixture.componentRef.setInput('pops', [{ id: 1, pad: 3, text: '+10' }]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const pads = queryAll(element, '.pad');
    const tapped = vi.fn();
    fixture.componentInstance.tapped.subscribe(tapped);

    pads[1]?.click();

    expect(pads.map((pad) => pad.className)).toEqual(['pad p0', 'pad p1', 'pad p2 lit', 'pad p3']);
    expect(pads[0]?.getAttribute('aria-label')).toBe('Drum pad Boom bass');
    expect(element.querySelector('.core.pulse b')?.textContent).toBe('3');
    expect(element.querySelector('.pop.q3')?.textContent).toBe('+10');
    expect(tapped).toHaveBeenCalledWith(1);
  });
});
