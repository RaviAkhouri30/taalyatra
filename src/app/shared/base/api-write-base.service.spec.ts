import { HttpResponse } from '@angular/common/http';
import { Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type Observable, firstValueFrom, of } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { LoggerService } from '@core/services/logger.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { ApiWriteBaseService } from './api-write-base.service';

@Service()
class NoteService extends ApiWriteBaseService<{ readonly text: string }> {
  public override create(note: { readonly text: string }): Observable<void> {
    return this.attachCreateApiHandler(ApiEndpoint.Proposals, note);
  }
}

describe('ApiWriteBaseService', () => {
  function setUp(status: number) {
    const post = vi.fn(() => of(new HttpResponse({ status })));
    TestBed.configureTestingModule({
      providers: [
        { provide: IHttpBackend, useValue: { post } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    return { service: TestBed.inject(NoteService), post };
  }

  it('should post the body to the endpoint and emit once when stored', async () => {
    const { service, post } = setUp(201);

    await expect(firstValueFrom(service.create({ text: 'hi' }))).resolves.toBeUndefined();
    expect(post).toHaveBeenCalledWith('proposals', { text: 'hi' });
  });

  it('should error when the backend rejects the write', async () => {
    const { service } = setUp(403);

    await expect(firstValueFrom(service.create({ text: 'hi' }))).rejects.toThrow('403');
  });
});
