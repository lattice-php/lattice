import { ReactNode } from 'react';
import { Affix } from '@lattice-php/core/generated';
/**
 * Wraps a single-line control in a prefix/suffix input group. The control is a
 * render prop receiving the class names that square the corners adjacent to an
 * affix; with no affixes the control renders untouched.
 *
 * The focus ring lives on the group, not the bare input, so it surrounds the
 * whole control — affixes included — instead of being clipped by the opaque
 * affix segments. The control itself stays the focus target; only its own ring
 * is suppressed.
 */
export declare function AffixGroup({ prefix, suffix, end, children, }: {
    prefix?: Affix | null;
    suffix?: Affix | null;
    end?: ReactNode;
    children: (controlClassName: string) => ReactNode;
}): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import('react').ReactPortal | import('react').ReactElement<unknown, string | import('react').JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
