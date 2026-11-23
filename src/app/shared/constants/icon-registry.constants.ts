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
  [IconName.Document]: [
    { tag: 'path', d: 'M6 3h8l4 4v14H6z' },
    { tag: 'path', d: 'M14 3v4h4M9 12h6M9 16h6' },
  ],
  [IconName.Image]: [
    { tag: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 2 },
    { tag: 'circle', cx: 8.5, cy: 10, r: 1.5 },
    { tag: 'path', d: 'M21 16l-5-5-8 8' },
  ],
  [IconName.Video]: [
    { tag: 'rect', x: 3, y: 6, width: 18, height: 12, rx: 2 },
    { tag: 'path', d: 'M10.5 9.5v5l4-2.5z' },
  ],
  [IconName.Toggle]: [
    { tag: 'rect', x: 3, y: 7, width: 18, height: 10, rx: 5 },
    { tag: 'circle', cx: 16, cy: 12, r: 2.5 },
  ],
  [IconName.Folder]: [
    {
      tag: 'path',
      d: 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
    },
  ],
  [IconName.Menu]: [{ tag: 'path', d: 'M4 7h16M4 12h16M4 17h16' }],
  [IconName.ChevronsLeft]: [{ tag: 'path', d: 'M11 17l-5-5 5-5M18 17l-5-5 5-5' }],
  [IconName.ChevronsRight]: [{ tag: 'path', d: 'M6 17l5-5-5-5M13 17l5-5-5-5' }],
  [IconName.Monitor]: [
    { tag: 'rect', x: 3, y: 4, width: 18, height: 12, rx: 2 },
    { tag: 'path', d: 'M8 20h8M12 16v4' },
  ],
  [IconName.Smartphone]: [
    { tag: 'rect', x: 7, y: 2, width: 10, height: 20, rx: 2 },
    { tag: 'path', d: 'M11 18h2' },
  ],
  [IconName.Columns]: [
    { tag: 'rect', x: 3, y: 4, width: 18, height: 16, rx: 2 },
    { tag: 'path', d: 'M12 4v16' },
  ],
  [IconName.ArrowUpRight]: [{ tag: 'path', d: 'M7 17L17 7M8 7h9v9' }],
  [IconName.Refresh]: [{ tag: 'path', d: 'M20 11a8 8 0 1 0-2.3 6M20 5v6h-6' }],
  [IconName.ExternalLink]: [
    {
      tag: 'path',
      d: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
    },
  ],
  [IconName.Flower]: [
    { tag: 'circle', cx: 12, cy: 12, r: 2.6 },
    {
      tag: 'path',
      d: 'M12 9.4C10 6 10.5 3.5 12 3.5s2 2.5 0 5.9zM14.6 12c3.4-2 5.9-1.5 5.9 0s-2.5 2-5.9 0zM12 14.6c2 3.4 1.5 5.9 0 5.9s-2-2.5 0-5.9zM9.4 12C6 14 3.5 13.5 3.5 12s2.5-2 5.9 0z',
    },
  ],
  [IconName.FourPointStar]: [
    { tag: 'path', d: 'M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z' },
  ],
  [IconName.Pennant]: [{ tag: 'path', d: 'M6 21V3M6 4l13 4.5L6 13' }],
  [IconName.Wheat]: [
    {
      tag: 'path',
      d: 'M12 22V6M12 6c0-2 1-3.5 0-4-1 .5 0 2 0 4zM12 10c-2.5 0-4-1.5-4-3 2 0 4 1 4 3zM12 10c2.5 0 4-1.5 4-3-2 0-4 1-4 3zM12 14c-2.5 0-4-1.5-4-3 2 0 4 1 4 3zM12 14c2.5 0 4-1.5 4-3-2 0-4 1-4 3zM12 18c-2.5 0-4-1.5-4-3 2 0 4 1 4 3zM12 18c2.5 0 4-1.5 4-3-2 0-4 1-4 3z',
    },
  ],
  [IconName.Wheel]: [
    { tag: 'circle', cx: 12, cy: 12, r: 8.5 },
    { tag: 'circle', cx: 12, cy: 12, r: 2 },
    {
      tag: 'path',
      d: 'M12 3.5V10M12 14v6.5M3.5 12H10M14 12h6.5M6 6l4.6 4.6M13.4 13.4L18 18M18 6l-4.6 4.6M10.6 13.4L6 18',
    },
  ],
  [IconName.Snowflake]: [
    {
      tag: 'path',
      d: 'M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9.5 3.5L12 5.5l2.5-2M9.5 20.5L12 18.5l2.5 2',
    },
  ],
  [IconName.Moon]: [{ tag: 'path', d: 'M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5z' }],
  [IconName.Twinkle]: [
    {
      tag: 'path',
      d: 'M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z',
    },
    { tag: 'circle', cx: 19, cy: 19, r: 1.2 },
    { tag: 'circle', cx: 5, cy: 4.5, r: 1 },
  ],
  [IconName.MusicNote]: [
    { tag: 'path', d: 'M9 18V5l11-2v13' },
    { tag: 'circle', cx: 6.5, cy: 18, r: 2.5 },
    { tag: 'circle', cx: 17.5, cy: 16, r: 2.5 },
  ],
};
