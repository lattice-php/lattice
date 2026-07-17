import { Component, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import type { Listen } from "@lattice-php/lattice/types/generated";

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
 * Renders nothing when a page declares no listeners, so the echo-react chunk
 * is only fetched where it is actually needed.
 */
export function RealtimeListeners({ listeners }: { listeners: Listen[] }) {
  if (listeners.length === 0) {
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
