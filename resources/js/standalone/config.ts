export type StandaloneConfig = {
  spriteUrl?: string;
  echo?: Record<string, unknown>;
};

function invalidConfig(): StandaloneConfig {
  console.warn(
    "[lattice] The data-lattice-config script holds invalid JSON; booting with defaults.",
  );

  return {};
}

export function readStandaloneConfig(doc: Document): StandaloneConfig {
  const script = doc.querySelector("script[data-lattice-config]");

  if (!script?.textContent) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(script.textContent);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return invalidConfig();
    }

    return parsed as StandaloneConfig;
  } catch {
    return invalidConfig();
  }
}
