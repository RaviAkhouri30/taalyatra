import { Component, Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, type Observable } from 'rxjs';
import { BaseComponent } from './base-component';
import { ViewModel } from './view-model';

@Injectable()
class ProbeViewModel extends ViewModel<string> {
  public readonly source$ = new Subject<string>();

  protected override attachViewHandler(): Observable<string> {
    return this.source$;
  }
}

@Component({ selector: 'app-probe', template: '', providers: [ProbeViewModel] })
class ProbeComponent extends BaseComponent<string> {
  protected override readonly model = inject(ProbeViewModel);
}

describe('BaseComponent', () => {
  it('should subscribe to the view model on init and unsubscribe on destroy', () => {
    const fixture = TestBed.createComponent(ProbeComponent);
    const viewModel = fixture.debugElement.injector.get(ProbeViewModel);

    fixture.detectChanges();
    expect(viewModel.source$.observed).toBe(true);

    fixture.destroy();
    expect(viewModel.source$.observed).toBe(false);
  });
});
