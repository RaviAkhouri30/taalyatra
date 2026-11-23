import { type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type FestiveEffect } from '@shared/components/festive-effects/effects/festive-effect';

/**
 * Renders one festival animation for its spec.
 * @param effect The effect's component.
 * @param compact Whether it draws around the badge.
 * @returns Its particle layer.
 */
export function renderEffect(effect: Type<FestiveEffect>, compact: boolean): HTMLElement {
  const fixture = TestBed.createComponent(effect);
  fixture.componentRef.setInput('compact', compact);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.fx')!;
}
