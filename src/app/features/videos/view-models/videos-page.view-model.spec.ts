import { TestBed } from '@angular/core/testing';
import { provideFakeContent } from '@shared/testing/fixtures';
import { VideosPageViewModel } from './videos-page.view-model';

describe('VideosPageViewModel', () => {
  function create(): VideosPageViewModel {
    TestBed.configureTestingModule({
      providers: [provideFakeContent().provider, VideosPageViewModel],
    });
    const model = TestBed.inject(VideosPageViewModel);
    model.init().subscribe();
    return model;
  }

  it('should show every video, the first featured, until a category is chosen', () => {
    const model = create();

    expect(model.category()).toBe('All');
    expect(model.featured()?.video.title).toBe('[Video title 1]');
    expect(model.rest()).toHaveLength(8);
    expect(model.countLabel()).toBe('Showing 9 videos');
  });

  it('should feature the first match and count only matches when a category is chosen', () => {
    const model = create();

    model.selectCategory('Workshops');

    expect(model.featured()?.video.category).toBe('Workshops');
    expect(model.rest().every((card) => card.video.category === 'Workshops')).toBe(true);
    expect(model.countLabel()).toBe('Showing 2 videos');
  });

  it('should have nothing to show before the page loads', () => {
    TestBed.configureTestingModule({
      providers: [provideFakeContent().provider, VideosPageViewModel],
    });
    const model = TestBed.inject(VideosPageViewModel);

    expect(model.featured()).toBeNull();
    expect(model.countLabel()).toBe('');
  });
});
