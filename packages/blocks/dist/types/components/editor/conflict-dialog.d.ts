/**
 * Shown when a save hits a newer server revision. Reloading discards the local
 * draft in favour of the server's; overwriting saves the local draft over it.
 * Dismissing is not an option: the editor cannot keep autosaving until the
 * user picks one.
 */
export declare function ConflictDialog({
  open,
  overwriting,
  onReload,
  onOverwrite,
}: {
  open: boolean;
  overwriting: boolean;
  onReload: () => void;
  onOverwrite: () => void;
}): import("react").JSX.Element;
