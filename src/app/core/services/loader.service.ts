import { Service, computed, signal } from '@angular/core';

/** Counts requests in flight so a loading indicator can show while any is pending. */
@Service()
export class LoaderService {
  /** True while at least one request is in flight. */
  public readonly isLoading = computed(() => this.pending() > 0);

  private readonly pending = signal(0);

  public start(): void {
    this.pending.update((count) => count + 1);
  }

  public stop(): void {
    this.pending.update((count) => Math.max(0, count - 1));
  }
}
