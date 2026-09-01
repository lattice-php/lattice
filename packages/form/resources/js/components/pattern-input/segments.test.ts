import { describe, expect, it } from "vitest";
import { decodeSegments, docToSegments, type PatternSegment, segmentsToDoc } from "./segments";

const token: PatternSegment = { type: "token", token: "NUMBER", config: { padding: "4" } };

describe("segmentsToDoc", () => {
  it("builds one paragraph for a single-line value", () => {
    const doc = segmentsToDoc([{ type: "text", value: "RE-" }, token], false);

    expect(doc.content).toHaveLength(1);
    expect(doc.content?.[0].content).toEqual([
      { type: "text", text: "RE-" },
      { type: "patternToken", attrs: { token: "NUMBER", config: { padding: "4" } } },
    ]);
  });

  it("splits text segments into paragraphs at line breaks when multiline", () => {
    const doc = segmentsToDoc([{ type: "text", value: "one\ntwo" }, token], true);

    expect(doc.content).toHaveLength(2);
    expect(doc.content?.[0].content).toEqual([{ type: "text", text: "one" }]);
    expect(doc.content?.[1].content).toEqual([
      { type: "text", text: "two" },
      { type: "patternToken", attrs: { token: "NUMBER", config: { padding: "4" } } },
    ]);
  });

  it("keeps empty lines as empty paragraphs when multiline", () => {
    const doc = segmentsToDoc([{ type: "text", value: "one\n\ntwo" }], true);

    expect(doc.content).toHaveLength(3);
    expect(doc.content?.[1]).toEqual({ type: "paragraph" });
  });

  it("strips line breaks in a single-line editor", () => {
    const doc = segmentsToDoc([{ type: "text", value: "one\ntwo" }], false);

    expect(doc.content).toHaveLength(1);
    expect(doc.content?.[0].content).toEqual([{ type: "text", text: "onetwo" }]);
  });
});

describe("decodeSegments", () => {
  it("accepts a server-seeded array as-is", () => {
    expect(decodeSegments([{ type: "text", value: " padded " }])).toEqual([
      { type: "text", value: " padded " },
    ]);
  });

  it("decodes the JSON-string form state without touching whitespace", () => {
    expect(decodeSegments('[{"type":"text","value":" one \\n"}]')).toEqual([
      { type: "text", value: " one \n" },
    ]);
  });

  it("returns an empty list for null, empty, and undecodable values", () => {
    expect(decodeSegments(null)).toEqual([]);
    expect(decodeSegments("")).toEqual([]);
    expect(decodeSegments("not-json")).toEqual([]);
    expect(decodeSegments('"a string"')).toEqual([]);
  });
});

describe("docToSegments", () => {
  it("joins paragraphs with line breaks inside text segments", () => {
    const roundTripped = docToSegments(
      segmentsToDoc([{ type: "text", value: "one\ntwo" }, token], true),
    );

    expect(roundTripped).toEqual([{ type: "text", value: "one\ntwo" }, token]);
  });

  it("emits a standalone line-break text segment between token-only paragraphs", () => {
    const doc = segmentsToDoc(
      [token, { type: "text", value: "\n" }, { type: "token", token: "YYYY", config: {} }],
      true,
    );

    expect(docToSegments(doc)).toEqual([
      token,
      { type: "text", value: "\n" },
      { type: "token", token: "YYYY", config: {} },
    ]);
  });

  it("round-trips empty lines", () => {
    const segments: PatternSegment[] = [{ type: "text", value: "one\n\ntwo" }];

    expect(docToSegments(segmentsToDoc(segments, true))).toEqual(segments);
  });
});
