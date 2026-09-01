import type { JSONContent } from "@tiptap/react";

export type TextSegment = { type: "text"; value: string };
export type TokenSegment = { type: "token"; token: string; config: Record<string, unknown> };
export type PatternSegment = TextSegment | TokenSegment;

/**
 * The form state holds the segments JSON-encoded (the server may seed a plain
 * array): a string survives Laravel's TrimStrings middleware untouched, while
 * an array submission would lose leading/trailing whitespace — and multiline
 * `\n` boundaries — from every text segment.
 */
export function decodeSegments(value: unknown): PatternSegment[] {
  if (Array.isArray(value)) {
    return value as PatternSegment[];
  }

  if (typeof value === "string" && value !== "") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as PatternSegment[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Line breaks live as `\n` inside text segments; in the editor they are
 * paragraphs. A single-line editor strips `\n` so a stored multiline value
 * cannot produce invalid Tiptap text nodes.
 */
export function segmentsToDoc(segments: PatternSegment[], multiline: boolean): JSONContent {
  const paragraphs: JSONContent[][] = [[]];

  for (const segment of segments) {
    if (segment.type === "token") {
      paragraphs[paragraphs.length - 1].push({
        type: "patternToken",
        attrs: { token: segment.token, config: segment.config },
      });
      continue;
    }

    const value = multiline ? segment.value : segment.value.replaceAll("\n", "");
    value.split("\n").forEach((part, index) => {
      if (index > 0) {
        paragraphs.push([]);
      }
      if (part !== "") {
        paragraphs[paragraphs.length - 1].push({ type: "text", text: part });
      }
    });
  }

  return {
    type: "doc",
    content: paragraphs.map((content) =>
      content.length > 0 ? { type: "paragraph", content } : { type: "paragraph" },
    ),
  };
}

export function docToSegments(doc: JSONContent): PatternSegment[] {
  const segments: PatternSegment[] = [];

  const appendText = (text: string) => {
    const last = segments[segments.length - 1];
    if (last?.type === "text") {
      last.value += text;
    } else {
      segments.push({ type: "text", value: text });
    }
  };

  (doc.content ?? []).forEach((paragraph, index) => {
    if (index > 0) {
      appendText("\n");
    }

    for (const node of paragraph.content ?? []) {
      if (node.type === "text" && node.text) {
        appendText(node.text);
      } else if (node.type === "patternToken") {
        const attrs = node.attrs ?? {};
        segments.push({
          type: "token",
          token: attrs.token as string,
          config: (attrs.config ?? {}) as Record<string, unknown>,
        });
      }
    }
  });

  return segments;
}
