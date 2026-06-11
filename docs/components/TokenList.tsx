import { useEffect, useRef, useState } from "react";
import type { Node } from "@lattice/lattice/core/types";
import { collectClassNames, resolveTokens } from "@lib/tokens";
import type { SuffixMap, ThemeToken } from "@lib/tokens";
import Preview from "./Preview.tsx";

type Props = {
  nodes: Node[];
  values?: Record<string, unknown>;
  tokens: ThemeToken[];
  suffixMap: SuffixMap;
};

const cellStyle = {
  fontSize: "0.75rem",
  padding: "0.4rem 0.75rem",
  textAlign: "left" as const,
  whiteSpace: "nowrap" as const,
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
        <Preview nodes={nodes} values={values} />
      </div>
      {used.length === 0 ? (
        <p>No tokens detected for this example.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={cellStyle}>Token</th>
              <th style={cellStyle}>Light</th>
              <th style={cellStyle}>Dark</th>
            </tr>
          </thead>
          <tbody>
            {used.map((token) => (
              <tr key={token.name}>
                <td style={cellStyle}>
                  <code>{token.name}</code>
                </td>
                <td style={cellStyle}>
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
                <td style={cellStyle}>
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
