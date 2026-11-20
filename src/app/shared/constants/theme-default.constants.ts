import { type IRootStyle } from '@core/interfaces/i-root-style';

/** Today's background (`$palette`'s `ink`), and the browser bar's colour with no theme. */
export const DEFAULT_BACKGROUND = '#171210';

/** Today's look: no variables (the stylesheet's defaults apply), no fonts to load, nothing to remember. */
export const DEFAULT_ROOT_STYLE: IRootStyle = {
  variables: new Map(),
  stylesheets: [],
  browserColour: DEFAULT_BACKGROUND,
  rememberedBackground: null,
};
