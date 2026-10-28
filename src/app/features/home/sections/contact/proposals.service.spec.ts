import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { type ProposalValue } from './proposal-form';
import { ProposalsService } from './proposals.service';

describe('ProposalsService', () => {
  it('should post the proposal to the proposals collection', async () => {
    const post = vi.fn(() => of(new HttpResponse({ status: 201 })));
    TestBed.configureTestingModule({ providers: [{ provide: IHttpBackend, useValue: { post } }] });
    const proposal = { name: 'Asha', phone: '9876543210' } as unknown as ProposalValue;

    await firstValueFrom(TestBed.inject(ProposalsService).create(proposal));

    expect(post).toHaveBeenCalledWith('proposals', proposal);
  });
});
