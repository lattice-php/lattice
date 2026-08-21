import { Suspense } from "react";
import { nodeIdentity } from "@lattice-php/core";
import type { RendererComponent } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { usePdfEngineRegistry } from "./engine-registry";

const PdfViewerComponent: RendererComponent<"pdf"> = ({ node }) => {
  const { t } = useT("pdf");
  const engines = usePdfEngineRegistry();
  const Engine = engines.engine;

  if (!Engine) {
    return (
      <div
        className="rounded-lt border border-lt-border bg-lt-muted p-4 text-sm text-lt-muted-fg"
        role="alert"
      >
        {t("pdf.engine-missing", "The PDF engine is not available.")}
      </div>
    );
  }

  return (
    <div
      className="lt-pdf"
      data-test={nodeIdentity(node)}
      style={
        node.props.maxHeight === null
          ? { height: node.props.height }
          : { maxHeight: node.props.maxHeight }
      }
    >
      <Suspense
        fallback={
          <div className="lt-pdf-status">
            <span role="status">{t("pdf.loading", "Loading document…")}</span>
          </div>
        }
      >
        <Engine node={node} />
      </Suspense>
    </div>
  );
};

export default PdfViewerComponent;
