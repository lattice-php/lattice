import type { IconName } from "@lattice-php/ui/icons";

export type MediaKind = "archive" | "audio" | "file" | "image" | "pdf" | "text" | "video";

const kindIcons: Record<MediaKind, IconName> = {
  archive: "file-archive",
  audio: "music",
  file: "file",
  image: "image",
  pdf: "file-text",
  text: "file-text",
  video: "film",
};

const archiveMimeTypes = [
  "application/gzip",
  "application/vnd.rar",
  "application/x-7z-compressed",
  "application/x-bzip2",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/zip",
];

export function mediaKind(mimeType: string): MediaKind {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (archiveMimeTypes.includes(mimeType)) {
    return "archive";
  }

  if (mimeType.startsWith("text/")) {
    return "text";
  }

  return "file";
}

export function kindIcon(mimeType: string): IconName {
  return kindIcons[mediaKind(mimeType)];
}

/**
 * The short type badge a card shows: the file's own extension, or the mime
 * subtype when the name carries none.
 */
export function typeLabel(name: string, mimeType: string): string {
  const extension = name.split(".").pop();

  if (extension !== undefined && extension !== name && /^[a-z0-9]{1,5}$/i.test(extension)) {
    return extension.toLowerCase();
  }

  return mimeType.split("/").pop() ?? mimeType;
}

const byteUnits = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

export function formatSize(bytes: number, locale: string): string {
  const exponent =
    bytes > 0 ? Math.min(Math.floor(Math.log10(bytes) / 3), byteUnits.length - 1) : 0;

  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: byteUnits[exponent],
    maximumFractionDigits: exponent === 0 ? 0 : 1,
  }).format(bytes / 1000 ** exponent);
}
