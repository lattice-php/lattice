import type { AnyExtension, Editor } from "@tiptap/core";
import type { StarterKitOptions } from "@tiptap/starter-kit";
import type { ComponentType } from "react";
import type { ResolveProps } from "@lattice-php/lattice/core/types";
import type {
  EditorExtension,
  EditorExtensionPropsMap,
} from "@lattice-php/lattice/types/generated";

/**
 * Consumer apps augment this via `declare module "@lattice-php/lattice"` to type
 * their custom extensions' props; built-ins resolve through
 * `EditorExtensionPropsMap`. The editor counterpart of `EffectProps`.
 */
export interface EditorExtensionProps {}

export type EditorExtensionPayloadOf<TType extends string> = ResolveProps<
  EditorExtensionProps,
  EditorExtensionPropsMap,
  TType,
  Record<string, unknown>
>;

export type ToolbarButton = {
  icon: string;
  key: string;
  label: string;
  isActive: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

/**
 * A toolbar item that renders its own markup (dropdowns, popovers) instead of
 * the standard icon button.
 */
export type ToolbarControl = {
  key: string;
  component: ComponentType<{ editor: Editor }>;
};

export type ToolbarItem = ToolbarButton | ToolbarControl;

export type ToolbarEntry = ToolbarItem | "separator";

export type RichEditorExtensionDefinition<P = Record<string, unknown>> = {
  /** Tiptap extension instances this wire type activates. */
  extensions?: (props: P) => AnyExtension[];
  /** Contribution to the single shared StarterKit configuration. */
  starterKit?: (props: P) => Partial<StarterKitOptions>;
  /** Toolbar items, in contribution order. */
  toolbar?: (props: P) => ToolbarItem[];
  /**
   * Adjacent toolbar contributions from the same group render without a
   * separator between them; defaults to the extension's own wire type.
   */
  group?: string;
};

export type ResolvedRichEditorExtension = {
  type: string;
  props: Record<string, unknown>;
  definition: RichEditorExtensionDefinition;
  group: string;
};

const registry = new Map<string, RichEditorExtensionDefinition>();

/**
 * Wire props arrive as `Partial` because a spec may omit `props` entirely;
 * definitions default each field themselves.
 */
export function registerRichEditorExtension<TType extends string>(
  type: TType,
  definition: RichEditorExtensionDefinition<Partial<EditorExtensionPayloadOf<TType>>>,
): void {
  registry.set(type, definition as unknown as RichEditorExtensionDefinition);
}

/**
 * Registration that yields to an existing entry. The built-ins load with the
 * lazy editor chunk — after app boot code ran — so seeding (instead of
 * registering) keeps a consumer's deliberate override of a built-in type.
 *
 * @internal
 */
export function seedRichEditorExtension<TType extends string>(
  type: TType,
  definition: RichEditorExtensionDefinition<Partial<EditorExtensionPayloadOf<TType>>>,
): void {
  if (!registry.has(type)) {
    registerRichEditorExtension(type, definition);
  }
}

const warned = new Set<string>();

export function resolveRichEditorExtensions(
  specs: EditorExtension[],
): ResolvedRichEditorExtension[] {
  const resolved: ResolvedRichEditorExtension[] = [];

  for (const spec of specs) {
    const definition = registry.get(spec.type);

    if (!definition) {
      if (import.meta.env.DEV && !warned.has(spec.type)) {
        warned.add(spec.type);
        console.warn(`[Lattice] Rich-editor extension "${spec.type}" is not registered.`);
      }

      continue;
    }

    resolved.push({
      type: spec.type,
      props: spec.props ?? {},
      definition,
      group: definition.group ?? spec.type,
    });
  }

  return resolved;
}

/**
 * One shared StarterKit for the whole editor: the always-on baseline (document,
 * paragraph, text, hard break, undo/redo, cursors and the invisible list/trailing
 * helpers) plus whatever the active extensions re-enable. Everything else is
 * explicitly disabled — StarterKit turns every feature on unless told otherwise.
 */
const DISABLED_STARTER_KIT_FEATURES: Partial<StarterKitOptions> = {
  blockquote: false,
  bold: false,
  bulletList: false,
  code: false,
  codeBlock: false,
  heading: false,
  horizontalRule: false,
  italic: false,
  link: false,
  listItem: false,
  orderedList: false,
  strike: false,
  underline: false,
};

export function assembleStarterKitOptions(
  extensions: ResolvedRichEditorExtension[],
): Partial<StarterKitOptions> {
  return extensions.reduce(
    (options, extension) => ({ ...options, ...extension.definition.starterKit?.(extension.props) }),
    { ...DISABLED_STARTER_KIT_FEATURES },
  );
}

export function assembleTiptapExtensions(
  extensions: ResolvedRichEditorExtension[],
): AnyExtension[] {
  return extensions.flatMap(
    (extension) => extension.definition.extensions?.(extension.props) ?? [],
  );
}

export function assembleToolbar(extensions: ResolvedRichEditorExtension[]): ToolbarEntry[] {
  const entries: ToolbarEntry[] = [];
  let previousGroup: string | null = null;

  for (const extension of extensions) {
    const items = extension.definition.toolbar?.(extension.props) ?? [];

    if (items.length === 0) {
      continue;
    }

    if (previousGroup !== null && previousGroup !== extension.group) {
      entries.push("separator");
    }

    entries.push(...items);
    previousGroup = extension.group;
  }

  return entries;
}
