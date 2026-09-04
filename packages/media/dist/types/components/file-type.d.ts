import { IconName } from '@lattice-php/ui/icons';
export type MediaKind = "archive" | "audio" | "file" | "image" | "pdf" | "text" | "video";
export declare function mediaKind(mimeType: string): MediaKind;
export declare function kindIcon(mimeType: string): IconName;
/**
 * The short type badge a card shows: the file's own extension, or the mime
 * subtype when the name carries none.
 */
export declare function typeLabel(name: string, mimeType: string): string;
export declare function formatSize(bytes: number, locale: string): string;
