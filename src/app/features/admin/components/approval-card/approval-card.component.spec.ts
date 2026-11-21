import { TestBed } from '@angular/core/testing';
import { ApprovalStatus } from '../../models/approval.model';
import { type IApprovalView } from '../../models/approvals-panel.model';
import { ApprovalCardComponent } from './approval-card.component';

describe('ApprovalCardComponent', () => {
  const view = (status: ApprovalStatus, problems = 0, answer = ''): IApprovalView => ({
    approval: {
      id: 'r1',
      by: 'manager',
      email: 'm@b.co',
      paths: ['home/hero'],
      note: 'New title',
      sentAt: 'x',
      status,
      answer,
      answeredAt: answer ? 'y' : '',
    },
    title: 'Hero',
    sentAt: '31 Oct 2026, 2:30 pm',
    answeredAt: '31 Oct 2026, 3:30 pm',
    problems,
  });

  function render(shown: IApprovalView, owner: boolean) {
    const fixture = TestBed.createComponent(ApprovalCardComponent);
    fixture.componentRef.setInput('view', shown);
    fixture.componentRef.setInput('owner', owner);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      Array.from(element.querySelectorAll('button')).find(
        (candidate) => candidate.textContent.trim() === name,
      );
    const click = (name: string) => {
      button(name)?.click();
      fixture.detectChanges();
    };
    return { component: fixture.componentInstance, element, button, click };
  }

  it('should show the owner who sent what, with their note', () => {
    const { element } = render(view(ApprovalStatus.Waiting), true);

    expect(element.querySelector('h3')?.textContent).toBe('Hero');
    expect(element.querySelector('.ap-when')?.textContent).toContain('From m@b.co');
    expect(element.querySelector('.ap-note')?.textContent).toBe('“New title”');
  });

  it('should approve', () => {
    const { component, click } = render(view(ApprovalStatus.Waiting), true);
    const approved = vi.fn();
    component.approved.subscribe(approved);

    click('Approve and publish');

    expect(approved).toHaveBeenCalled();
  });

  it('should not approve while there are problems, and say why', () => {
    const { element, button } = render(view(ApprovalStatus.Waiting, 2), true);

    expect(button('Approve and publish')?.disabled).toBe(true);
    expect(element.querySelector('.ap-problems')?.textContent).toContain('2 problems');
  });

  it('should ask for a reason before sending back', () => {
    const { component, element, click } = render(view(ApprovalStatus.Waiting, 1), true);
    const sentBack = vi.fn();
    component.sentBack.subscribe(sentBack);

    click('Send back');
    click('Send back');
    expect(element.querySelector('.ap-error')?.textContent).toContain('Write a reason');
    const field = element.querySelector('textarea')!;
    field.value = '  Wrong dates ';
    field.dispatchEvent(new Event('input'));
    click('Send back');

    expect(sentBack).toHaveBeenCalledExactlyOnceWith('Wrong dates');
    expect(element.querySelector('.ap-problems')?.textContent).toContain('1 problem to fix');
  });

  it('should let the owner change their mind about sending back', () => {
    const { element, click } = render(view(ApprovalStatus.Waiting), true);

    click('Send back');
    click('Cancel');

    expect(element.querySelector('textarea')).toBeNull();
  });

  it('should tell the manager it is waiting, and let them withdraw it', () => {
    const { component, element, click } = render(view(ApprovalStatus.Waiting), false);
    const withdrawn = vi.fn();
    component.withdrawn.subscribe(withdrawn);

    click('Withdraw');

    expect(element.querySelector('.ap-status')?.textContent).toContain('Waiting for the owner');
    expect(withdrawn).toHaveBeenCalled();
  });

  it('should tell the manager why it came back, and let them clear it', () => {
    const { component, element, click } = render(
      view(ApprovalStatus.SentBack, 0, 'Wrong dates'),
      false,
    );
    const dismissed = vi.fn();
    component.dismissed.subscribe(dismissed);

    click('Clear');

    expect(element.querySelector('.ap-status')?.textContent).toContain('Sent back, 31 Oct');
    expect(element.querySelector('.ap-answer')?.textContent).toBe('“Wrong dates”');
    expect(dismissed).toHaveBeenCalled();
  });

  it('should tell the manager it went live', () => {
    const { element } = render(view(ApprovalStatus.Approved), false);

    expect(element.querySelector('.ap-status')?.textContent).toContain('Approved and published');
  });

  it('should name who answered, when it’s known (0024 D6)', () => {
    const answered = view(ApprovalStatus.Approved);
    const { element } = render(
      { ...answered, approval: { ...answered.approval, answeredBy: 's@b.co' } },
      false,
    );

    expect(element.querySelector('.ap-status')?.textContent).toContain(
      'Approved and published by s@b.co, 31 Oct',
    );
  });

  it('should let a manager who can approve take their waiting request back to approve it (0023)', () => {
    const fixture = TestBed.createComponent(ApprovalCardComponent);
    fixture.componentRef.setInput('view', view(ApprovalStatus.Waiting));
    fixture.componentRef.setInput('canApproveOwn', true);
    fixture.detectChanges();
    const approvedOwn = vi.fn();
    fixture.componentInstance.approvedOwn.subscribe(approvedOwn);

    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((candidate) => candidate.textContent.trim() === 'Approve it yourself')
      ?.click();

    expect(approvedOwn).toHaveBeenCalled();
  });
});
