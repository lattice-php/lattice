import { useEcho, useEchoPresence, useEchoPublic } from "@laravel/echo-react";
import { useCallback } from "react";
import { useEffectDispatcher } from "@lattice-php/lattice/effects/use-effect-dispatcher";
import { useT } from "@lattice-php/lattice/i18n";
import { buildEffects } from "./build-effects";
import type { RawEffect } from "./build-effects";
import type { ListenerPayload } from "@lattice-php/lattice/types/generated";

function useListenerHandler(listener: ListenerPayload): (payload: unknown) => void {
  const { t } = useT("lattice");
  const dispatch = useEffectDispatcher();

  return useCallback(
    (payload: unknown) => {
      const data = (typeof payload === "object" && payload !== null ? payload : {}) as Record<
        string,
        unknown
      >;
      dispatch(buildEffects(listener.effects as unknown as RawEffect[], data, t));
    },
    [dispatch, listener, t],
  );
}

function PublicListener({ listener }: { listener: ListenerPayload }) {
  useEchoPublic(listener.channel, listener.events, useListenerHandler(listener));
  return null;
}

function PrivateListener({ listener }: { listener: ListenerPayload }) {
  useEcho(listener.channel, listener.events, useListenerHandler(listener));
  return null;
}

function PresenceListener({ listener }: { listener: ListenerPayload }) {
  useEchoPresence(listener.channel, listener.events, useListenerHandler(listener));
  return null;
}

function Listener({ listener }: { listener: ListenerPayload }) {
  switch (listener.visibility) {
    case "private":
      return <PrivateListener listener={listener} />;
    case "presence":
      return <PresenceListener listener={listener} />;
    default:
      return <PublicListener listener={listener} />;
  }
}

export default function Subscriptions({ listeners }: { listeners: ListenerPayload[] }) {
  return (
    <>
      {listeners.map((listener, index) => (
        <Listener key={`${listener.visibility}:${listener.channel}:${index}`} listener={listener} />
      ))}
    </>
  );
}
