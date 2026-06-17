import { Component, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import type { ListenerPayload } from "./types";

const Subscriptions = lazy(() => import("./subscriptions"));

class EchoBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    console.warn(
      "[lattice] Real-time listeners are declared but Echo is unavailable. Install @laravel/echo-react and call configureEcho().",
    );
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Mounts the real-time listeners declared on a page. Renders nothing when a
 * page has none, so the echo-react chunk is only fetched where it is needed.
 */
export function RealtimeListeners({ listeners }: { listeners?: ListenerPayload[] }) {
  if (listeners === undefined || listeners.length === 0) {
    return null;
  }

  return (
    <EchoBoundary>
      <Suspense fallback={null}>
        <Subscriptions listeners={listeners} />
      </Suspense>
    </EchoBoundary>
  );
}
