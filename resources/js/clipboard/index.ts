import { useState } from "react";
import { copyToClipboard } from "@lattice-php/lattice/ui/copyable-text";

export { CopyableText, copyToClipboard } from "@lattice-php/lattice/ui/copyable-text";

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

export function useClipboard(): UseClipboardReturn {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = async (text) => {
    const copied = await copyToClipboard(text);

    setCopiedText(copied ? text : null);

    return copied;
  };

  return [copiedText, copy];
}
