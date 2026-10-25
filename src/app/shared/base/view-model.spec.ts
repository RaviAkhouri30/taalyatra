import { Subject, firstValueFrom, type Observable } from 'rxjs';
import { ViewModel } from './view-model';

class DefaultViewModel extends ViewModel<number> {
  public set(value: number): void {
    this.setData(value);
  }

  public increment(): void {
    this.updateData((current) => (current ?? 0) + 1);
  }
}

class StreamingViewModel extends ViewModel<string> {
  public readonly view$ = new Subject<string>();
  public readonly command$ = new Subject<string>();

  protected override attachViewHandler(): Observable<string> {
    return this.view$;
  }

  protected override attachCommandHandler(): Observable<string> {
    return this.command$;
  }
}

describe('ViewModel', () => {
  it('should start without data', () => {
    expect(new DefaultViewModel().data()).toBeUndefined();
  });

  it('should complete immediately when no handlers are overridden', async () => {
    await expect(
      firstValueFrom(new DefaultViewModel().init(), { defaultValue: 'done' }),
    ).resolves.toBe('done');
  });

  it('should replace and update the view state', () => {
    const model = new DefaultViewModel();

    model.increment();
    expect(model.data()).toBe(1);
    model.set(10);
    model.increment();
    expect(model.data()).toBe(11);
  });

  it('should merge view and command streams into void emissions', () => {
    const model = new StreamingViewModel();
    const emissions: unknown[] = [];
    const subscription = model.init().subscribe((value) => emissions.push(value));

    model.view$.next('loaded');
    model.command$.next('clicked');
    subscription.unsubscribe();

    expect(emissions).toEqual([undefined, undefined]);
  });
});
