import type { Method } from "@inertiajs/core";

export type BulkActionVariant =
  | "default"
  | "destructive"
  | "ghost"
  | "link"
  | "outline"
  | "secondary";

export type BulkActionConfirmation = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  title?: string;
};

export type BulkAction = {
  id: string;
  label: string;
  method: Method;
  endpoint: string;
  ref: string;
  variant: BulkActionVariant;
  confirmation: BulkActionConfirmation | null;
};

const methods = ["delete", "get", "patch", "post", "put"] satisfies Method[];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asMethod(value: unknown): Method {
  return methods.includes(value as Method) ? (value as Method) : "post";
}

function asVariant(value: unknown): BulkActionVariant {
  return typeof value === "string" ? (value as BulkActionVariant) : "default";
}

function asConfirmation(value: unknown): BulkActionConfirmation | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as BulkActionConfirmation;
}

export function getBulkActions(value: unknown): BulkAction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): BulkAction[] => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const record = item as Record<string, unknown>;
    const props =
      typeof record.props === "object" && record.props !== null
        ? (record.props as Record<string, unknown>)
        : {};
    const endpoint = asString(props.endpoint);

    if (endpoint === "") {
      return [];
    }

    return [
      {
        id: asString(record.id),
        label: asString(props.label, "Run action"),
        method: asMethod(props.method),
        endpoint,
        ref: asString(props.ref),
        variant: asVariant(props.variant),
        confirmation: asConfirmation(props.confirmation),
      },
    ];
  });
}
