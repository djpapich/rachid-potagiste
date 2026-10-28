import React from 'react';
import { PageView } from '../types/index.ts';
import { pageToPath } from '../lib/router.ts';

interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  page: PageView;
  onNavigate: (page: PageView) => void;
  /** Called after navigation (e.g. to close a menu). */
  onAfter?: () => void;
}

/**
 * A real <a href> (crawlable, middle-click / "open in new tab" works, URL shown on hover)
 * that navigates without a full page reload on a normal click.
 */
export const NavLink: React.FC<NavLinkProps> = ({ page, onNavigate, onAfter, children, ...rest }) => (
  <a
    {...rest}
    href={pageToPath(page)}
    onClick={(e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      onNavigate(page);
      onAfter?.();
    }}
  >
    {children}
  </a>
);
