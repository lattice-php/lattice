import "../css/browser.css";
import { createRoot } from "react-dom/client";
import { ApiReference, type ApiReferenceProps } from "./with-sprite";

/**
 * Renders the reference into `element` without a React app around it, for the
 * self-contained `dist-browser` bundle. Returns a function that unmounts it.
 */
export function mount(element: Element, props: ApiReferenceProps): () => void {
  const root = createRoot(element);
  root.render(<ApiReference {...props} />);

  return () => root.unmount();
}
