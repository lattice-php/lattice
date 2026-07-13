import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const apiJson = vi.fn<(...args: unknown[]) => Promise<unknown>>();
vi.mock("@lattice-php/lattice/core/api", () => ({ apiJson: (...a: unknown[]) => apiJson(...a) }));

import { useBlockPreview } from "./use-block-preview";

beforeEach(() => apiJson.mockReset());

it("seeds initial wire and refreshes a block on demand", async () => {
  apiJson.mockResolvedValueOnce({ wire: [{ type: "heading", props: { text: "New" } }] });

  const { result } = renderHook(() =>
    useBlockPreview({
      endpoint: "/lattice/blocks/render",
      ref: "sealed",
      initial: { a: [{ type: "heading", props: { text: "Old" } }] },
      renderedWith: {},
    }),
  );

  expect(result.current.wireFor("a")).toEqual([{ type: "heading", props: { text: "Old" } }]);

  await act(async () => {
    await result.current.refresh("a", "hero", { title: "New" });
  });

  expect(apiJson).toHaveBeenCalledWith("/lattice/blocks/render", {
    method: "POST",
    ref: "sealed",
    body: JSON.stringify({ type: "hero", attributes: { title: "New" } }),
  });
  expect(result.current.wireFor("a")).toEqual([{ type: "heading", props: { text: "New" } }]);
});

it("keeps the previous wire when a refresh fails", async () => {
  apiJson.mockRejectedValueOnce(new Error("boom"));

  const { result } = renderHook(() =>
    useBlockPreview({
      endpoint: "/e",
      ref: "r",
      initial: { a: [{ type: "text", props: { text: "keep" } }] },
      renderedWith: {},
    }),
  );

  await act(async () => {
    await result.current.refresh("a", "text", {});
  });

  expect(result.current.wireFor("a")).toEqual([{ type: "text", props: { text: "keep" } }]);
});

it("skips the request when a block is unchanged since its last render", async () => {
  apiJson.mockResolvedValue({ wire: [] });

  const { result } = renderHook(() =>
    useBlockPreview({
      endpoint: "/e",
      ref: "r",
      initial: { a: [{ type: "heading", props: { text: "Seeded" } }] },
      renderedWith: { a: { type: "hero", attributes: { title: "Seeded" } } },
    }),
  );

  await act(async () => {
    await result.current.refresh("a", "hero", { title: "Seeded" });
  });
  expect(apiJson).not.toHaveBeenCalled();

  await act(async () => {
    await result.current.refresh("a", "hero", { title: "Changed" });
  });
  expect(apiJson).toHaveBeenCalledTimes(1);

  await act(async () => {
    await result.current.refresh("a", "hero", { title: "Changed" });
  });
  expect(apiJson).toHaveBeenCalledTimes(1);
});

it("retries an unchanged block after a failed render", async () => {
  apiJson.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce({ wire: [] });

  const { result } = renderHook(() =>
    useBlockPreview({ endpoint: "/e", ref: "r", initial: {}, renderedWith: {} }),
  );

  await act(async () => {
    await result.current.refresh("a", "hero", { title: "x" });
  });
  await act(async () => {
    await result.current.refresh("a", "hero", { title: "x" });
  });

  expect(apiJson).toHaveBeenCalledTimes(2);
});
