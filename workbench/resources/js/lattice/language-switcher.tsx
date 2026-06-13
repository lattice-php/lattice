import { i18n, useT } from "@lattice-php/lattice/i18n";
import { useState } from "react";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

const LANGUAGES = ["en", "de"] as const;

export function LanguageSwitcher() {
  const { t } = useT(WORKBENCH_I18N_NAMESPACE);
  const [language, setLanguage] = useState(i18n.language);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-1 rounded-lt border border-lt-border bg-lt-surface p-1 shadow-md">
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          aria-label={t(`language.${code}`, code)}
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
