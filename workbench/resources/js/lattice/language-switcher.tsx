import { i18n } from "@lattice/lattice/i18n";
import { useState } from "react";

const LANGUAGES = ["en", "de"] as const;

/**
 * Demo control: switches the Lattice chrome language. Picking `de` makes
 * react-i18next fetch /locales/de/lattice.json from the laravel-i18next backend,
 * so the toolbar, pagination and a11y labels render in German.
 */
export function LanguageSwitcher() {
  const [language, setLanguage] = useState(i18n.language);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-1 rounded-lt border border-lt-border bg-lt-surface p-1 shadow-md">
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          data-test={`language-${code}`}
          onClick={() => {
            void i18n.changeLanguage(code);
            setLanguage(code);
          }}
          className={`rounded-lt-sm px-2 py-1 text-xs font-medium uppercase ${
            language === code
              ? "bg-lt-primary text-lt-primary-fg"
              : "text-lt-muted-fg hover:bg-lt-muted"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
