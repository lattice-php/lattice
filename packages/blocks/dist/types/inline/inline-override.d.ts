import { RendererComponent } from '@lattice-php/core';
/**
 * The editor's replacement for a node type that may carry a field binding:
 * unbound nodes render exactly as the app renders them, bound nodes become
 * the inline control that matches the field.
 */
export declare function inlineOverride(nodeType: string): RendererComponent;
