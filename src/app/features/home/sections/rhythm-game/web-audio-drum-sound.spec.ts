import { TestBed } from '@angular/core/testing';
import { RANDOM } from '@shared/tokens/random.token';
import { WebAudioDrumSound } from './web-audio-drum-sound';

/** Minimal stand-in for the Web Audio graph: records which nodes each hit creates. */
class FakeAudioContext {
  public static readonly instances: FakeAudioContext[] = [];
  public state = 'suspended';
  public readonly currentTime = 1;
  public readonly sampleRate = 100;
  public readonly destination = {};
  public readonly created: string[] = [];
  public readonly resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });

  public constructor() {
    FakeAudioContext.instances.push(this);
  }

  public createGain() {
    return this.node('gain', { gain: param() });
  }

  public createOscillator() {
    return this.node('oscillator', { frequency: param(), start: vi.fn(), stop: vi.fn() });
  }

  public createBuffer(_channels: number, length: number) {
    const data = new Float32Array(length);
    return { getChannelData: () => data };
  }

  public createBufferSource() {
    return this.node('source', { start: vi.fn() });
  }

  public createBiquadFilter() {
    return this.node('filter', { frequency: param(), Q: param() });
  }

  private node(kind: string, extra: object) {
    this.created.push(kind);
    const node = { ...extra, connect: (target: unknown) => target };
    return node;
  }
}

function param() {
  return { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
}

describe('WebAudioDrumSound', () => {
  function create(audio: object | undefined): WebAudioDrumSound {
    FakeAudioContext.instances.length = 0;
    vi.stubGlobal('AudioContext', audio);
    TestBed.configureTestingModule({ providers: [{ provide: RANDOM, useValue: () => 0.5 }] });
    return TestBed.runInInjectionContext(() => new WebAudioDrumSound());
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should build each pad sound from its tone and noise layers', () => {
    const sound = create(FakeAudioContext);

    sound.play(0);
    sound.play(3);
    const context = FakeAudioContext.instances[0]!;

    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(context.resume).toHaveBeenCalledTimes(1);
    expect(context.created.filter((kind) => kind === 'oscillator')).toHaveLength(2);
    expect(context.created.filter((kind) => kind === 'source')).toHaveLength(4);
  });

  it('should ignore unknown pads', () => {
    const sound = create(FakeAudioContext);

    sound.play(9);

    expect(FakeAudioContext.instances[0]?.created).toEqual([]);
  });

  it('should stay silent where Web Audio is unavailable', () => {
    const sound = create(undefined);

    expect(() => {
      sound.play(1);
    }).not.toThrow();
  });
});
