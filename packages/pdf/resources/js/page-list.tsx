import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Ref, RefObject } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { PdfPage } from "./pdf-page";
import type { SearchState } from "./use-search";
import type { PageTextCache } from "./text-cache";

export type PageListHandle = {
  scrollToPage(page: number): void;
};

type PageListProps = {
  ref: Ref<PageListHandle>;
  scrollRootRef: RefObject<HTMLDivElement | null>;
  doc: PDFDocumentProxy;
  scale: number;
  baseSize: { width: number; height: number };
  textCache: PageTextCache;
  search: SearchState;
  onVisiblePageChange(page: number): void;
};

export function PageList({
  ref,
  scrollRootRef,
  doc,
  scale,
  baseSize,
  textCache,
  search,
  onVisiblePageChange,
}: PageListProps): React.ReactElement {
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mountedPages, setMountedPages] = useState<ReadonlySet<number>>(new Set([1]));
  const pages = Array.from({ length: doc.numPages }, (_, index) => index + 1);

  // Scroll only the viewer's own container — scrollIntoView would also
  // scroll every outer ancestor (including the window), yanking the page
  // and the viewer toolbar out of view.
  const scrollToPage = useCallback(
    (page: number): void => {
      const container = scrollRootRef.current;
      const slot = slotRefs.current[page - 1];

      if (container && slot) {
        container.scrollTo({ top: Math.max(0, slot.offsetTop - 16) });
      }
    },
    [scrollRootRef],
  );

  useImperativeHandle(ref, () => ({ scrollToPage }), [scrollToPage]);

  useEffect(() => {
    const container = scrollRootRef.current;

    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setMountedPages((current) => {
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
  }, [doc, scrollRootRef]);

  useEffect(() => {
    const container = scrollRootRef.current;

    if (!container) {
      return;
    }

    let frame = 0;
    const updateVisiblePage = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const midpoint = container.scrollTop + container.clientHeight / 2;
        let visible = 1;

        for (const slot of slotRefs.current) {
          if (slot && slot.offsetTop <= midpoint) {
            visible = Number(slot.dataset.page);
          }
        }

        onVisiblePageChange(visible);
      });
    };

    container.addEventListener("scroll", updateVisiblePage, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", updateVisiblePage);
    };
  }, [doc, onVisiblePageChange, scrollRootRef]);

  const currentMatch = search.currentMatch;

  return (
    <div className="lt-pdf-pages">
      {pages.map((page) => (
        <div
          className="lt-pdf-slot"
          data-page={page}
          key={page}
          ref={(slot) => {
            slotRefs.current[page - 1] = slot;
          }}
          // minHeight stays on mounted slots too: a freshly mounted page has a
          // 0-height canvas until its async render sizes it, and a collapsing
          // slot above the viewport shifts the scroll position a full page.
          style={{
            minHeight: Math.floor(baseSize.height * scale),
            ...(mountedPages.has(page) ? {} : { width: "100%" }),
          }}
        >
          {mountedPages.has(page) ? (
            <PdfPage
              currentStart={currentMatch?.page === page ? currentMatch.start : null}
              doc={doc}
              matches={search.matchesForPage(page)}
              onNavigateToPage={scrollToPage}
              pageNumber={page}
              scale={scale}
              textCache={textCache}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
