/** One SVG primitive of a stroke icon drawn on a 24×24 grid. */
export type IconNode =
  | { readonly tag: 'path'; readonly d: string }
  | { readonly tag: 'circle'; readonly cx: number; readonly cy: number; readonly r: number }
  | {
      readonly tag: 'ellipse';
      readonly cx: number;
      readonly cy: number;
      readonly rx: number;
      readonly ry: number;
    }
  | {
      readonly tag: 'rect';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly rx: number;
    };
