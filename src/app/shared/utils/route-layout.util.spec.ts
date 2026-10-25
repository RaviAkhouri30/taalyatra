import { type ActivatedRouteSnapshot, type Data } from '@angular/router';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { DEFAULT_PAGE_LAYOUT, isPageLayout, resolvePageLayout } from './route-layout.util';

/** Minimal stand-in for a route snapshot: just data and the next node. */
interface SnapshotNode {
  data: Data;
  firstChild: SnapshotNode | null;
}

/** Builds a minimal snapshot chain from root to leaf. */
function chain(...data: Data[]): ActivatedRouteSnapshot {
  const nodes: SnapshotNode[] = data.map((entry) => ({ data: entry, firstChild: null }));
  nodes.forEach((node, index) => {
    node.firstChild = nodes[index + 1] ?? null;
  });
  return nodes[0] as unknown as ActivatedRouteSnapshot;
}

describe('route layout utils', () => {
  it('should recognise layout values', () => {
    expect(isPageLayout(PageLayout.Home)).toBe(true);
    expect(isPageLayout('elsewhere')).toBe(false);
    expect(isPageLayout(undefined)).toBe(false);
  });

  it('should default to the inner-page layout when no route declares one', () => {
    expect(resolvePageLayout(chain({}, {}))).toBe(DEFAULT_PAGE_LAYOUT);
  });

  it('should let the deepest route override its parent', () => {
    expect(resolvePageLayout(chain({ layout: PageLayout.Bare }, { layout: PageLayout.Home }))).toBe(
      PageLayout.Home,
    );
  });

  it('should keep a parent layout when the child declares none', () => {
    expect(resolvePageLayout(chain({ layout: PageLayout.Bare }, {}))).toBe(PageLayout.Bare);
  });

  it('should ignore invalid layout data', () => {
    expect(resolvePageLayout(chain({ layout: 42 }))).toBe(DEFAULT_PAGE_LAYOUT);
  });
});
