import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { type RouterStateSnapshot, type TitleStrategy } from '@angular/router';
import { SeoTitleStrategy } from './seo-title.service';

describe('SeoTitleStrategy', () => {
  it('should leave the tab’s title alone when the router asks it to update', () => {
    const title = TestBed.inject(Title);
    title.setTitle('Set by SeoService');

    const strategy: TitleStrategy = TestBed.inject(SeoTitleStrategy);
    strategy.updateTitle({} as RouterStateSnapshot);

    expect(title.getTitle()).toBe('Set by SeoService');
  });
});
