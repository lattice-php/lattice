export type StandaloneConfig = {
  spriteUrl?: string;
  echo?: Record<string, unknown>;
};

export function readStandaloneConfig(doc: Document): StandaloneConfig {
  const script = doc.querySelector("script[data-lattice-config]");

  if (!script?.textContent) {
    return {};
  }

  try {
    return JSON.parse(script.textContent) as StandaloneConfig;
  } catch {
    console.warn(
      "[lattice] The data-lattice-config script holds invalid JSON; booting with defaults.",
    );

    return {};
  }
}
