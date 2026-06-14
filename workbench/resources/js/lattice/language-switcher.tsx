import { LocaleSwitcher } from "@lattice-php/lattice/i18n";
import { WORKBENCH_I18N_NAMESPACE } from "./i18n";

export function LanguageSwitcher() {
  return (
    <LocaleSwitcher namespace={WORKBENCH_I18N_NAMESPACE}>
      {({ options, setLocale }) => (
        <div className="fixed bottom-4 right-4 z-50 flex gap-1 rounded-lt border border-lt-border bg-lt-surface p-1 shadow-md">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-label={option.label}
              data-test={`language-${option.value}`}
              onClick={() => setLocale(option.value)}
              className={`rounded-lt-sm px-2 py-1 text-xs font-medium uppercase ${
                option.active
                  ? "bg-lt-primary text-lt-primary-fg"
                  : "text-lt-muted-fg hover:bg-lt-muted"
              }`}
            >
              {option.value}
            </button>
          ))}
        </div>
      )}
    </LocaleSwitcher>
  );
}
