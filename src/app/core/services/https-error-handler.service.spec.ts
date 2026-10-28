import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NEVER, Subject, firstValueFrom, of, throwError, toArray } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { BackendResponseError, HttpsErrorHandler } from './https-error-handler.service';
import { LoaderService } from './loader.service';
import { LoggerService } from './logger.service';

describe('HttpsErrorHandler', () => {
  const error = vi.fn();

  function setUp(timeoutMs = 1000) {
    error.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: LoggerService, useValue: { error } },
        { provide: APP_ENVIRONMENT, useValue: { ...environment, requestTimeoutMs: timeoutMs } },
      ],
    });
    return { handler: TestBed.inject(HttpsErrorHandler), loader: TestBed.inject(LoaderService) };
  }

  it('should pass a successful response through and track loading', async () => {
    const { handler, loader } = setUp();
    const response$ = new Subject<HttpResponse<string>>();
    const result = firstValueFrom(handler.handle(response$));

    expect(loader.isLoading()).toBe(true);
    response$.next(new HttpResponse({ status: 200, body: 'ok' }));
    response$.complete();

    await expect(result).resolves.toMatchObject({ body: 'ok' });
    expect(loader.isLoading()).toBe(false);
  });

  it('should report a non-2xx response and complete without emitting', async () => {
    const { handler } = setUp();

    const values = await firstValueFrom(
      handler.handle(of(new HttpResponse<string>({ status: 404 }))).pipe(toArray()),
    );

    expect(values).toEqual([]);
    expect(error.mock.calls[0]?.[1]).toBeInstanceOf(BackendResponseError);
    expect((error.mock.calls[0]?.[1] as BackendResponseError).status).toBe(404);
  });

  it('should report a thrown error', async () => {
    const { handler, loader } = setUp();

    await firstValueFrom(handler.handle(throwError(() => new Error('offline'))).pipe(toArray()));

    expect(error).toHaveBeenCalledWith('Backend request failed', new Error('offline'));
    expect(loader.isLoading()).toBe(false);
  });

  it('should time out a request that never answers', async () => {
    const { handler } = setUp(5);

    await firstValueFrom(handler.handle(NEVER).pipe(toArray()));

    expect(error).toHaveBeenCalledTimes(1);
  });

  it('should not start loading until subscribed', () => {
    const { handler, loader } = setUp();

    handler.handle(NEVER);

    expect(loader.isLoading()).toBe(false);
  });

  describe('handleCommand', () => {
    it('should pass a successful response through', async () => {
      const { handler } = setUp();

      await expect(
        firstValueFrom(handler.handleCommand(of(new HttpResponse({ status: 201, body: 'id' })))),
      ).resolves.toMatchObject({ status: 201 });
    });

    it('should report and rethrow when the backend answers non-2xx', async () => {
      const { handler, loader } = setUp();

      await expect(
        firstValueFrom(handler.handleCommand(of(new HttpResponse<string>({ status: 403 })))),
      ).rejects.toBeInstanceOf(BackendResponseError);
      expect(error).toHaveBeenCalledTimes(1);
      expect(loader.isLoading()).toBe(false);
    });

    it('should report and rethrow when the request errors', async () => {
      const { handler } = setUp();

      await expect(
        firstValueFrom(handler.handleCommand(throwError(() => new Error('offline')))),
      ).rejects.toThrow('offline');
      expect(error).toHaveBeenCalledWith('Backend request failed', new Error('offline'));
    });
  });
});
