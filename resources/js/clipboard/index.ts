import { useState } from "react";

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
}

export function useClipboard(): UseClipboardReturn {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = async (text) => {
    const copied = await copyToClipboard(text);

    setCopiedText(copied ? text : null);

    return copied;
  };

  return [copiedText, copy];
}
