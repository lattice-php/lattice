import { KeyboardEvent } from 'react';
import { EditorStore } from '../../document/store';
/**
 * The editor-wide shortcuts: undo/redo, select the neighbouring block, delete,
 * duplicate, and Alt+Arrow to move. Text controls keep their own keys.
 */
export declare function handleEditorKeyDown(event: KeyboardEvent, store: EditorStore, focusBlock: (id: string) => void): void;
