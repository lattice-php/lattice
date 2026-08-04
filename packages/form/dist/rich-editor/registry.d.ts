import { AnyExtension, Editor } from '@tiptap/core';
import { StarterKitOptions } from '@tiptap/starter-kit';
import { ComponentType } from 'react';
import { ResolveProps } from '@lattice-php/core/types';
import { EditorExtension, EditorExtensionPropsMap } from '@lattice-php/core/generated';
/**
 * Consumer apps augment this via `declare module "@lattice-php/form/rich-editor"` to type
 * their custom extensions' props; built-ins resolve through
 * `EditorExtensionPropsMap`. The editor counterpart of `EffectProps`.
 */
export interface EditorExtensionProps {
}
export type EditorExtensionPayloadOf<TType extends string> = ResolveProps<EditorExtensionProps, EditorExtensionPropsMap, TType, Record<string, unknown>>;
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
    component: ComponentType<{
        editor: Editor;
    }>;
};
export type ToolbarItem = ToolbarButton | ToolbarControl;
export type ToolbarEntry = ToolbarItem | "separator";
export type RichEditorExtensionDefinition<P = Record<string, unknown>> = {
    extensions?: (props: P) => AnyExtension[];
    /** Contribution to the single shared StarterKit configuration. */
    starterKit?: (props: P) => Partial<StarterKitOptions>;
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
/**
 * Wire props stay `Partial` at the definition boundary — a client-registered
 * type's props carry no generated shape, so definitions default each field.
 */
export declare function registerRichEditorExtension<TType extends string>(type: TType, definition: RichEditorExtensionDefinition<Partial<EditorExtensionPayloadOf<TType>>>): void;
/**
 * Registration that yields to an existing entry. The built-ins load with the
 * lazy editor chunk — after app boot code ran — so seeding (instead of
 * registering) keeps a consumer's deliberate override of a built-in type.
 *
 * @internal
 */
export declare function seedRichEditorExtension<TType extends string>(type: TType, definition: RichEditorExtensionDefinition<Partial<EditorExtensionPayloadOf<TType>>>): void;
export declare function resolveRichEditorExtensions(specs: EditorExtension[]): ResolvedRichEditorExtension[];
export declare function assembleStarterKitOptions(extensions: ResolvedRichEditorExtension[]): Partial<StarterKitOptions>;
export declare function assembleTiptapExtensions(extensions: ResolvedRichEditorExtension[]): AnyExtension[];
export declare function assembleToolbar(extensions: ResolvedRichEditorExtension[]): ToolbarEntry[];
