export type RichDocument = Record<string, unknown>;

type RichNode = { type?: string; content?: RichNode[]; text?: string };

/** A document that holds nothing a reader would notice: no nodes, or one empty paragraph. */
export function isEmptyDocument(document: RichDocument | null | undefined): boolean {
  if (!document) {
    return true;
  }

  const content = (document as RichNode).content ?? [];

  if (content.length === 0) {
    return true;
  }

  const [first] = content;

  return (
    content.length === 1 &&
    first?.type === "paragraph" &&
    (first.content === undefined || first.content.length === 0)
  );
}

export function textDocument(text: string): RichDocument | null {
  if (text === "") {
    return null;
  }

  return { content: [{ content: [{ text, type: "text" }], type: "paragraph" }], type: "doc" };
}

/** The top-level nodes of a document, ready to append to another one. */
export function documentContent(document: RichDocument | null | undefined): RichNode[] {
  return isEmptyDocument(document) ? [] : ((document as RichNode).content ?? []);
}
