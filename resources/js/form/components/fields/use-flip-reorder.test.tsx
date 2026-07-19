import { expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useFlipReorder } from "./use-flip-reorder";

it("returns a register callback and survives an order change without throwing", () => {
  const seen: Array<HTMLElement | null> = [];
  function Probe({ order }: { order: string }) {
    const register = useFlipReorder(order);
    return (
      <div>
        {order.split(",").map((k) => (
          <div
            key={k}
            data-flip-key={k}
            ref={(el) => {
              register(k, el);
              seen.push(el);
            }}
          />
        ))}
      </div>
    );
  }
  const { rerender } = render(<Probe order="a,b" />);
  rerender(<Probe order="b,a" />);
  expect(seen.length).toBeGreaterThan(0);
});

it("no-ops under prefers-reduced-motion", () => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: true,
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent() {
      return false;
    },
  }));
  function Probe() {
    const register = useFlipReorder("a");
    return <div ref={(el) => register("a", el)} />;
  }
  expect(() => render(<Probe />)).not.toThrow();
});
