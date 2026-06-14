import { router } from "@inertiajs/react";
import type { ActionResult, Effect, EffectType } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { setLocale } from "@lattice-php/lattice/i18n/locale";

export type ActionEffect = Effect;

/** The server's action response. Fields are optional: a handler may omit any of them. */
export type ActionResponse = Partial<ActionResult>;

const eventNames = {
  toast: LATTICE_EVENT.toast,
  reloadComponent: LATTICE_EVENT.reloadComponent,
  reloadPage: LATTICE_EVENT.reloadPage,
  redirect: LATTICE_EVENT.redirect,
  download: LATTICE_EVENT.download,
  openModal: LATTICE_EVENT.openModal,
  closeModal: LATTICE_EVENT.closeModal,
  resetForm: LATTICE_EVENT.resetForm,
  localeChange: LATTICE_EVENT.localeChange,
} satisfies Record<EffectType, string>;

function triggerDownload(url: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function dispatchActionEffects(effects: ActionEffect[]): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const effect of effects) {
    if (effect.type === "reloadPage") {
      router.reload();
      continue;
    }

    if (effect.type === "redirect") {
      router.visit(effect.url);
      continue;
    }

    if (effect.type === "download") {
      triggerDownload(effect.url);
      continue;
    }

    if (effect.type === "localeChange") {
      setLocale(effect.locale);
      continue;
    }

    window.dispatchEvent(new CustomEvent(eventNames[effect.type], { detail: effect }));
  }
}

export function dispatchActionError(error: unknown): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(LATTICE_EVENT.actionError, { detail: { error } }));
}

export function getActionEffects(effects: unknown): ActionEffect[] {
  return Array.isArray(effects) ? effects.filter(isActionEffect) : [];
}

export function isActionEffect(effect: unknown): effect is ActionEffect {
  return (
    typeof effect === "object" &&
    effect !== null &&
    "type" in effect &&
    typeof effect.type === "string" &&
    Object.hasOwn(eventNames, effect.type)
  );
}
