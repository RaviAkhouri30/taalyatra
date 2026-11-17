/**
 * Stand-ins for the browser APIs jsdom lacks: Web Animations, `matchMedia`, and the
 * intersection and resize observers. Each test decides when an observer fires.
 */

/** An animation the test can inspect and finish. */
export class FakeAnimation {
  public readonly cancel = vi.fn();
  public progress: number | null;
  private readonly finishListeners: (() => void)[] = [];

  public constructor(
    public readonly keyframes: Keyframe[],
    public readonly options: KeyframeAnimationOptions,
  ) {
    // An animation with no duration has finished at once, like the browser's.
    this.progress = options.duration === 0 ? 1 : 0;
  }

  public get effect(): { getComputedTiming: () => { progress: number | null } } {
    return { getComputedTiming: () => ({ progress: this.progress }) };
  }

  public addEventListener(type: string, listener: () => void): void {
    if (type === 'finish') {
      this.finishListeners.push(listener);
    }
  }

  /** Plays it to the end, as the browser would after its duration. */
  public finish(): void {
    this.progress = 1;
    this.finishListeners.splice(0).forEach((listener) => {
      listener();
    });
  }
}

/** @returns Every animation started on any element from now on, in order. */
export function stubAnimate(): FakeAnimation[] {
  const started: FakeAnimation[] = [];
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value(keyframes: Keyframe[], options: KeyframeAnimationOptions): FakeAnimation {
      const animation = new FakeAnimation(keyframes, options);
      started.push(animation);
      return animation;
    },
  });
  return started;
}

/** @param reduced Whether the device asks for reduced motion. */
export function stubMatchMedia(reduced: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({ matches: reduced && query.includes('reduce') }),
  });
}

/** An observer whose callback the test fires; covers both intersection and resize. */
export class FakeObserver {
  public static readonly created: FakeObserver[] = [];
  public readonly observed: Element[] = [];
  public readonly disconnect = vi.fn();

  public constructor(
    private readonly callback: (entries: { isIntersecting: boolean }[]) => void,
    public readonly options?: IntersectionObserverInit,
  ) {
    FakeObserver.created.push(this);
  }

  public observe(element: Element): void {
    this.observed.push(element);
  }

  /** @param isIntersecting Whether the element is now in the observed band. */
  public fire(isIntersecting = true): void {
    this.callback([{ isIntersecting }]);
  }
}

/** Installs `FakeObserver` as both observers; undo with `vi.unstubAllGlobals()`. */
export function stubObservers(): typeof FakeObserver.created {
  FakeObserver.created.length = 0;
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  vi.stubGlobal('ResizeObserver', FakeObserver);
  return FakeObserver.created;
}
