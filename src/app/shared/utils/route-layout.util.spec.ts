import { type ActivatedRouteSnapshot, type Data } from '@angular/router';
import { PageLayout } from '@shared/enums/page-layout.enum';
import {
  DEFAULT_PAGE_LAYOUT,
  isPageLayout,
  resolvePageLayout,
  resolvePageMeta,
} from './route-layout.util';
import { SeoPage } from '@shared/enums/seo-page.enum';

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

  describe('resolvePageMeta', () => {
    /** A snapshot chain whose nodes may carry a title. */
    function titled(...nodes: { data: Data; title?: string }[]): ActivatedRouteSnapshot {
      const root = chain(...nodes.map((node) => node.data));
      let current: (SnapshotNode & { title?: string }) | null = root as unknown as SnapshotNode;
      for (const node of nodes) {
        if (current) {
          if (node.title) current.title = node.title;
          current = current.firstChild;
        }
      }
      return root;
    }

    it('should take the deepest title and drop query and fragment', () => {
      const root = titled({ data: {}, title: 'Admin' }, { data: {}, title: 'Hero — Admin' });

      expect(resolvePageMeta(root, '/admin/hero?x=1#card')).toEqual({
        path: '/admin/hero',
        title: 'Hero — Admin',
        description: '',
      });
    });

    it('should leave title and description empty when no route declares them', () => {
      expect(resolvePageMeta(chain({}, { layout: PageLayout.Home }), '/')).toEqual({
        path: '/',
        title: '',
        description: '',
      });
    });

    it('should name a public page when its route does', () => {
      expect(resolvePageMeta(chain({ seo: SeoPage.Videos }), '/videos')).toEqual({
        path: '/videos',
        title: '',
        description: '',
        page: SeoPage.Videos,
      });
    });

    it('should name the page whose stored text replaces the defaults when the route gives one', () => {
      expect(resolvePageMeta(chain({ seo: SeoPage.Team }, {}), '/team').page).toBe(SeoPage.Team);
    });

    it('should name no page when the route gives an unknown one', () => {
      expect(resolvePageMeta(chain({ seo: 'admin' }), '/admin')).not.toHaveProperty('page');
    });
  });
});
