import { Fragment, lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type { Extension } from "@codemirror/state";
import type { RendererComponent } from "@lattice-php/core/types";
import { cn } from "@lattice-php/ui/lib/utils";
import { CopyButton } from "@lattice-php/ui/copyable-text";

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
        "max-w-full overflow-auto p-3 font-lt-mono text-xs",
        wrap && "whitespace-pre-wrap wrap-anywhere",
      )}
      style={{ maxHeight: maxHeight ?? undefined }}
    >
      {lineNumbers ? (
        <code className="grid grid-cols-[auto_1fr]">
          {children.split("\n").map((line, index) => (
            <Fragment key={index}>
              <span
                aria-hidden="true"
                className="mr-3 border-r border-lt-border pr-3 text-right text-lt-muted-fg select-none"
              >
                {index + 1}
              </span>
              <span>{line || "\u200b"}</span>
            </Fragment>
          ))}
        </code>
      ) : (
        children
      )}
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
          className="absolute top-3 right-6 z-10 bg-lt-bg/80 hover:bg-lt-bg"
        />
      ) : null}
      <Suspense fallback={fallback}>
        <CodeBlockView
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
