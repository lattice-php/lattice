import { useEffect, useRef, useState } from "react";
import type { Node } from "@lattice/lattice/core/types";
import { collectClassNames, resolveTokens, tokenLabel } from "@lib/tokens";
import type { SuffixMap, ThemeToken } from "@lib/tokens";
import LatticePreview from "./LatticePreview.tsx";

type Props = {
  nodes: Node[];
  values?: Record<string, unknown>;
  tokens: ThemeToken[];
  suffixMap: SuffixMap;
};

export default function TokenList({ nodes, values = {}, tokens, suffixMap }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [used, setUsed] = useState<ThemeToken[]>([]);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) {
      return;
    }

    const seen = new Set<string>();
    const scan = () => {
      let changed = false;
      for (const name of resolveTokens(collectClassNames(element), suffixMap)) {
        if (!seen.has(name)) {
          seen.add(name);
          changed = true;
        }
      }
      if (changed) {
        setUsed(tokens.filter((token) => seen.has(token.name)));
      }
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(element, {
      attributeFilter: ["class"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [tokens, suffixMap]);

  return (
    <>
      <div ref={previewRef} style={{ display: "none" }} aria-hidden="true">
        <LatticePreview nodes={nodes} values={values} />
      </div>
      {used.length === 0 ? (
        <p>No Lattice tokens detected for this example.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Light</th>
              <th>Dark</th>
            </tr>
          </thead>
          <tbody>
            {used.map((token) => (
              <tr key={token.name}>
                <td>
                  <code>{token.name}</code>
                  <br />
                  <small>{tokenLabel(token.name)}</small>
                </td>
                <td>
                  <span
                    style={{
                      background: token.light,
                      border: "1px solid var(--sl-color-gray-5)",
                      borderRadius: "0.25rem",
                      display: "inline-block",
                      height: "1rem",
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                      width: "1rem",
                    }}
                  />
                  <code>{token.light}</code>
                </td>
                <td>
                  <span
                    style={{
                      background: token.dark,
                      border: "1px solid var(--sl-color-gray-5)",
                      borderRadius: "0.25rem",
                      display: "inline-block",
                      height: "1rem",
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                      width: "1rem",
                    }}
                  />
                  <code>{token.dark}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
