import { useEffect, useState } from "react";
import { RenderNode } from "@lattice-php/core/renderer";
import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import type { Callout as CalloutMessage } from "../../generated";
import { UI_NAMESPACE, useT } from "../../i18n";
import { resolveText } from "../../i18n/translatable";
import { useNavigation } from "../../navigation";
import { onCallout, onRetractCallout } from "../../toast/callout";
import { Callout } from "./callout";

type CalloutItem = CalloutMessage & { id: number };

let nextId = 0;

/**
 * A keyed callout is a projection of server state: it replaces any callout
 * sharing its key and is dropped when the navigation adapter reports a
 * completed navigation. Inertia only reports URL-changing visits (initial load
 * included); a same-URL visit — `router.reload()`, `redirect()->back()` to the
 * same URL, polling, partial reloads — never fires it, so the callout survives
 * until the server overwrites or drops it. On URL-changing visits `navigate`
 * fires before `flash`, so re-assertion always wins over the clear and no
 * ordering guard is needed. A `retract-callout` effect clears one on a
 * same-URL response too.
 */
export const CalloutsAdapter: RendererComponent<"callouts"> = ({ node }) => {
  const { t } = useT(UI_NAMESPACE);
  const { onNavigate } = useNavigation();
  const [callouts, setCallouts] = useState<CalloutItem[]>([]);

  useEffect(
    () =>
      onCallout((callout) => {
        setCallouts((current) => {
          const kept = callout.unique
            ? current.filter((existing) => existing.unique !== callout.unique)
            : current;

          return [...kept, { ...callout, id: nextId++ }];
        });
      }),
    [],
  );

  useEffect(
    () =>
      onNavigate(() => {
        setCallouts((current) => current.filter((callout) => !callout.unique));
      }),
    [onNavigate],
  );

  useEffect(
    () =>
      onRetractCallout((unique) => {
        setCallouts((current) => current.filter((callout) => callout.unique !== unique));
      }),
    [],
  );

  function dismiss(id: number): void {
    setCallouts((current) => current.filter((callout) => callout.id !== id));
  }

  if (callouts.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-2" data-test={nodeIdentity(node)}>
      {callouts.map((callout) => (
        <Callout
          key={callout.id}
          action={callout.action ? <RenderNode node={callout.action} /> : undefined}
          dismissLabel={t("common.dismiss", "Dismiss")}
          dismissible={callout.dismissible}
          message={resolveText(callout.message, t)}
          onDismiss={() => dismiss(callout.id)}
          title={callout.title ? resolveText(callout.title, t) : undefined}
          variant={callout.variant}
        />
      ))}
    </div>
  );
};
