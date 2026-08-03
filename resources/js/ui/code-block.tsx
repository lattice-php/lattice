import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type { Extension } from "@codemirror/state";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";
import { CopyButton } from "./copyable-text";

const CodeBlockView = lazy(() => import("./code-block-view"));

type CodeBlockLanguage = "text" | "json" | "javascript" | "shell" | "php";
type CodeBlockLanguageLoader = () => Promise<Extension>;

interface CodeBlockProps extends Omit<ComponentProps<"div">, "children"> {
  children: string;
  copyable?: boolean;
  language?: CodeBlockLanguage | CodeBlockLanguageLoader;
  lineNumbers?: boolean;
  maxHeight?: number | null;
  wrap?: boolean;
}

interface CodeBlockViewProps {
  children: string;
  copyable: boolean;
  language: CodeBlockLanguage | CodeBlockLanguageLoader;
  lineNumbers: boolean;
  maxHeight: number | null;
  wrap: boolean;
}

function CodeBlock({
  "aria-label": ariaLabel,
  children,
  className,
  copyable = false,
  language = "text",
  lineNumbers = false,
  maxHeight = null,
  role = ariaLabel ? "region" : undefined,
  wrap = false,
  ...props
}: CodeBlockProps) {
  const fallback = (
    <pre
      className={cn(
        "max-w-full overflow-x-auto p-3 font-lt-mono text-xs",
        wrap && "whitespace-pre-wrap wrap-anywhere",
        copyable && "pt-11",
      )}
      style={{ maxHeight: maxHeight ?? undefined }}
    >
      {children}
    </pre>
  );

  return (
    <div
      data-slot="code-block"
      aria-label={ariaLabel}
      role={role}
      {...props}
      className={cn(
        "relative max-w-full overflow-hidden rounded-lt-sm bg-lt-muted text-lt-fg",
        className,
      )}
    >
      {copyable ? (
        <CopyButton
          value={children}
          label={ariaLabel ?? "code"}
          iconOnly
          className="absolute top-2 right-2 z-10 bg-lt-bg/80 hover:bg-lt-bg"
        />
      ) : null}
      <Suspense fallback={fallback}>
        <CodeBlockView
          copyable={copyable}
          language={language}
          lineNumbers={lineNumbers}
          maxHeight={maxHeight}
          wrap={wrap}
        >
          {children}
        </CodeBlockView>
      </Suspense>
    </div>
  );
}

const CodeBlockComponent: RendererComponent<"code-block"> = ({ node }) => (
  <CodeBlock
    copyable={node.props.copyable}
    language={node.props.language}
    lineNumbers={node.props.lineNumbers}
    maxHeight={node.props.maxHeight}
    wrap={node.props.wrap}
  >
    {node.props.code}
  </CodeBlock>
);

export default CodeBlockComponent;
export { CodeBlock };
export type { CodeBlockLanguage, CodeBlockLanguageLoader, CodeBlockProps, CodeBlockViewProps };
