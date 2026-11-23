import { DeferBlockState, TestBed } from '@angular/core/testing';
import { Festival } from '@shared/enums/festival.enum';
import { FestiveEffectsComponent } from './festive-effects.component';

/** Each festival's effect, by its element's name. */
const EFFECTS: readonly (readonly [Festival, string])[] = [
  [Festival.Diwali, 'app-diwali-effect'],
  [Festival.Holi, 'app-holi-effect'],
  [Festival.Navratri, 'app-navratri-effect'],
  [Festival.GaneshChaturthi, 'app-ganesh-chaturthi-effect'],
  [Festival.Dussehra, 'app-dussehra-effect'],
  [Festival.Baisakhi, 'app-baisakhi-effect'],
  [Festival.Gurpurab, 'app-gurpurab-effect'],
  [Festival.Christmas, 'app-christmas-effect'],
  [Festival.Halloween, 'app-halloween-effect'],
  [Festival.NewYear, 'app-new-year-effect'],
];

describe('FestiveEffectsComponent', () => {
  async function render(festival?: Festival, compact = false): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(FestiveEffectsComponent);
    if (festival) fixture.componentRef.setInput('festival', festival);
    fixture.componentRef.setInput('compact', compact);
    fixture.detectChanges();
    // Each effect loads on its own (@defer); finish loading it.
    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }
    return fixture.nativeElement as HTMLElement;
  }

  it('should draw nothing by default', async () => {
    expect((await render()).querySelector('.fx')).toBeNull();
  });

  it('should draw nothing for no festival', async () => {
    expect((await render(Festival.None)).querySelector('.fx')).toBeNull();
  });

  it.each(EFFECTS)('should draw %s’s own effect, and only it', async (festival, selector) => {
    const element = await render(festival);

    expect(element.querySelector(selector)).not.toBeNull();
    expect(element.querySelectorAll('.fx')).toHaveLength(1);
  });

  it('should pass on drawing around the badge', async () => {
    const element = await render(Festival.Holi, true);

    expect(element.querySelector('.fx')?.classList).toContain('fx--compact');
  });
});
