import { Node } from "@lattice-php/core";
/**
 * Hosts real form fields outside a form: every write goes straight to the
 * block's data instead of a submit. The inspector's content tab and the
 * inline popovers share this stack.
 */
export declare function FieldEmbed({
  id,
  schema,
  initial,
  errors,
  onChange,
}: {
  id: string;
  schema: readonly Node[];
  initial: Record<string, unknown>;
  errors: Record<string, string[]> | undefined;
  onChange: (field: string, value: unknown) => void;
}): import("react").JSX.Element;
