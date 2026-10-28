import { IconName } from '@shared/enums/icon-name.enum';
import { type IconNode } from '@shared/interfaces/i-icon-node';

/**
 * Stroke icons copied verbatim from the design prototype (24×24 grid, round caps and joins).
 * Add an icon here and to `IconName`; `IconComponent` renders it.
 */
export const ICON_REGISTRY: Readonly<Record<IconName, readonly IconNode[]>> = {
  [IconName.Phone]: [
    {
      tag: 'path',
      d: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1.1 1A16 16 0 0 1 4 5.1 1 1 0 0 1 5 4z',
    },
  ],
  [IconName.Mail]: [
    { tag: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 2 },
    { tag: 'path', d: 'M3 7l9 6 9-6' },
  ],
  [IconName.MapPin]: [
    { tag: 'path', d: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z' },
    { tag: 'circle', cx: 12, cy: 10, r: 2.6 },
  ],
  [IconName.WhatsApp]: [
    { tag: 'path', d: 'M5 19l1.4-4A8 8 0 1 1 9 17.6z' },
    {
      tag: 'path',
      d: 'M9.5 9c.5 2.5 2.5 4.5 5 5l1-1.2-2-1-.8.7c-.8-.4-1.5-1.1-1.9-1.9l.7-.8-1-2z',
    },
  ],
  [IconName.Instagram]: [
    { tag: 'rect', x: 3, y: 3, width: 18, height: 18, rx: 5 },
    { tag: 'circle', cx: 12, cy: 12, r: 4 },
    { tag: 'circle', cx: 17.2, cy: 6.8, r: 1 },
  ],
  [IconName.YouTube]: [
    { tag: 'rect', x: 2.5, y: 5, width: 19, height: 14, rx: 4 },
    { tag: 'path', d: 'M11 9.5l4.5 2.5-4.5 2.5z' },
  ],
  [IconName.Facebook]: [
    {
      tag: 'path',
      d: 'M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V3h-2.2A4 4 0 0 0 11 7v1.5H9V11h2v10h3V11h2.2l.4-2.5z',
    },
  ],
  [IconName.Lock]: [
    { tag: 'rect', x: 4, y: 10, width: 16, height: 10, rx: 2 },
    { tag: 'path', d: 'M8 10V7a4 4 0 0 1 8 0v3' },
  ],
  [IconName.Home]: [{ tag: 'path', d: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' }],
  [IconName.ChatBubble]: [{ tag: 'path', d: 'M4 5h16v11H9l-5 4z' }],
  [IconName.Sparkle]: [
    {
      tag: 'path',
      d: 'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1',
    },
    { tag: 'circle', cx: 12, cy: 12, r: 3.6 },
  ],
  [IconName.Djembe]: [
    { tag: 'ellipse', cx: 12, cy: 7, rx: 7, ry: 2.5 },
    { tag: 'path', d: 'M5 7c.3 3 2 5 3 6l-1 6h10l-1-6c1-1 2.7-3 3-6' },
  ],
  [IconName.Group]: [
    { tag: 'path', d: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19' },
    { tag: 'circle', cx: 10, cy: 8, r: 3.2 },
    { tag: 'path', d: 'M19 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.2 5.2a3.2 3.2 0 0 1 0 5.6' },
  ],
  [IconName.Briefcase]: [
    { tag: 'rect', x: 3, y: 7, width: 18, height: 13, rx: 2 },
    { tag: 'path', d: 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18' },
  ],
  [IconName.Star]: [
    { tag: 'path', d: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z' },
  ],
  [IconName.Clock]: [
    { tag: 'circle', cx: 12, cy: 12, r: 9 },
    { tag: 'path', d: 'M12 7v5l3 2' },
  ],
  [IconName.Mic]: [
    { tag: 'rect', x: 9, y: 3, width: 6, height: 11, rx: 3 },
    { tag: 'path', d: 'M5 11a7 7 0 0 0 14 0M12 18v3' },
  ],
  [IconName.Guitar]: [
    { tag: 'circle', cx: 9, cy: 15, r: 5 },
    { tag: 'path', d: 'M12.5 11.5l6-6M16 4l4 4' },
  ],
  [IconName.Pulse]: [{ tag: 'path', d: 'M3 12h2l2-6 3 14 3-11 2 5 2-2h4' }],
  [IconName.Procession]: [
    { tag: 'path', d: 'M13 4.5a1.5 1.5 0 1 0 0-.1M11 21l1-6-3-3 1-5 3 2 3 1M9 21l1.5-4' },
  ],
  [IconName.Expand]: [{ tag: 'path', d: 'M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5' }],
  [IconName.Building]: [
    { tag: 'rect', x: 4, y: 3, width: 16, height: 18, rx: 2 },
    { tag: 'path', d: 'M9 8h2M13 8h2M9 12h2M13 12h2M10 21v-4h4v4' },
  ],
  [IconName.Check]: [{ tag: 'path', d: 'M4 12.5l5 5L20 6.5' }],
  [IconName.Close]: [{ tag: 'path', d: 'M5 5l14 14M19 5L5 19' }],
  [IconName.Send]: [{ tag: 'path', d: 'M4 12l16-8-6 16-3-7z' }],
  [IconName.Copy]: [
    { tag: 'rect', x: 9, y: 9, width: 11, height: 11, rx: 2 },
    { tag: 'path', d: 'M15 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h4' },
  ],
};
