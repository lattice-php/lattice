import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { Option } from "@lattice-php/core/types";
import { SegmentedControl } from "@lattice-php/ui/components/segmented-control/segmented-control";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";

const THUMBNAIL_WIDTH = 128;

type SidebarTab = "pages" | "attachments";

type AttachmentEntry = {
  id: string;
  filename: string;
  content: Uint8Array | null;
};

type SidebarProps = {
  doc: PDFDocumentProxy;
  baseSize: { width: number; height: number };
  currentPage: number;
  onSelectPage(page: number): void;
};

async function downloadAttachment(doc: PDFDocumentProxy, entry: AttachmentEntry): Promise<void> {
  const content = entry.content ?? (await doc.getAttachmentContent(entry.id));

  if (!content) {
    return;
  }

  const url = URL.createObjectURL(new Blob([content as BlobPart]));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = entry.filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function Thumbnail({
  doc,
  pageNumber,
  height,
  mounted,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  height: number;
  mounted: boolean;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!mounted || !canvas) {
      return;
    }

    let cancelled = false;
    let cancelRender: (() => void) | null = null;

    void (async () => {
      const page = await doc.getPage(pageNumber);

      if (cancelled) {
        return;
      }

      const viewport = page.getViewport({
        scale: THUMBNAIL_WIDTH / page.getViewport({ scale: 1 }).width,
      });
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const renderTask = page.render({
        canvas,
        viewport,
        transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
      });
      cancelRender = () => renderTask.cancel();

      renderTask.promise.catch(() => {});
    })().catch(() => {});

    return () => {
      cancelled = true;
      cancelRender?.();
    };
  }, [doc, pageNumber, mounted]);

  return <canvas height={height} ref={canvasRef} width={THUMBNAIL_WIDTH} />;
}

export function Sidebar({
  doc,
  baseSize,
  currentPage,
  onSelectPage,
}: SidebarProps): React.ReactElement {
  const { t } = useT("pdf");
  const scrollRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tab, setTab] = useState<SidebarTab>("pages");
  const [attachments, setAttachments] = useState<AttachmentEntry[]>([]);
  const [mountedThumbnails, setMountedThumbnails] = useState<ReadonlySet<number>>(new Set());
  const pages = Array.from({ length: doc.numPages }, (_, index) => index + 1);
  const thumbnailHeight = Math.round((baseSize.height / baseSize.width) * THUMBNAIL_WIDTH);

  useEffect(() => {
    let cancelled = false;

    doc
      .getAttachments()
      .then((entries) => {
        if (cancelled || !entries) {
          return;
        }

        setAttachments(
          [...entries.entries()].map(([id, attachment]) => ({
            id,
            filename: attachment.filename,
            content: attachment.content ?? null,
          })),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [doc]);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container || tab !== "pages") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setMountedThumbnails((current) => {
          const next = new Set(current);

          for (const entry of entries) {
            const page = Number((entry.target as HTMLElement).dataset.page);

            if (entry.isIntersecting) {
              next.add(page);
            } else {
              next.delete(page);
            }
          }

          return next;
        });
      },
      { root: container, rootMargin: "100% 0px" },
    );

    for (const slot of slotRefs.current) {
      if (slot) {
        observer.observe(slot);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [doc, tab]);

  const tabOptions: Option[] = [
    { data: null, value: "pages", label: t("pdf.sidebar.pages", "Pages") },
    { data: null, value: "attachments", label: t("pdf.sidebar.attachments", "Attachments") },
  ];

  return (
    <div className="lt-pdf-sidebar" data-test="pdf-sidebar">
      {attachments.length > 0 ? (
        <div className="lt-pdf-sidebar-tabs">
          <SegmentedControl
            aria-label={t("pdf.sidebar.label", "Document sidebar")}
            name="pdf-sidebar-tab"
            onValueChange={(value) => setTab(value as SidebarTab)}
            options={tabOptions}
            value={tab}
          />
        </div>
      ) : null}
      <div className="lt-pdf-sidebar-scroll" ref={scrollRef}>
        {tab === "pages" ? (
          pages.map((page) => (
            <button
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={t("pdf.link.page", "Go to page {{page}}", { page })}
              className="lt-pdf-thumb"
              data-page={page}
              data-test="pdf-thumbnail"
              key={page}
              onClick={() => onSelectPage(page)}
              ref={(slot) => {
                slotRefs.current[page - 1] = slot;
              }}
              type="button"
            >
              <Thumbnail
                doc={doc}
                height={thumbnailHeight}
                mounted={mountedThumbnails.has(page)}
                pageNumber={page}
              />
              <span className="text-xs text-lt-muted-fg tabular-nums">{page}</span>
            </button>
          ))
        ) : (
          <ul className="lt-pdf-attachments">
            {attachments.map((entry) => (
              <li key={entry.id}>
                <button
                  className="lt-pdf-attachment"
                  data-test="pdf-attachment"
                  onClick={() => void downloadAttachment(doc, entry)}
                  type="button"
                >
                  <span className="truncate">{entry.filename}</span>
                  <Icon aria-hidden="true" className="size-lt-icon-sm shrink-0" name="download" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
