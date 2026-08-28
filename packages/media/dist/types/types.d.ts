import { ComponentPropsMap, EditorExtensionPropsMap } from './generated';
declare module "@lattice-php/core" {
    interface ComponentProps extends ComponentPropsMap {
    }
}
declare module "@lattice-php/form/rich-editor/registry" {
    interface EditorExtensionProps extends EditorExtensionPropsMap {
    }
}
