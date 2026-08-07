import { CodeBlock, SegmentedPills } from "@lattice-php/ui";

export type SnippetLanguage = "curl" | "javascript";

type SnippetPanelProps = {
  idPrefix: string;
  language: SnippetLanguage;
  snippet: string;
  onLanguageChange: (language: SnippetLanguage) => void;
};

const SNIPPET_LANGUAGES = [
  { label: "cURL", value: "curl", data: null },
  { label: "JavaScript", value: "javascript", data: null },
];

export function SnippetPanel({
  idPrefix,
  language,
  snippet,
  onLanguageChange,
}: SnippetPanelProps): React.ReactNode {
  return (
    <section className="flex flex-col gap-3">
      <SegmentedPills
        name={`${idPrefix}-request-snippet-language`}
        ariaLabel="Snippet language"
        options={SNIPPET_LANGUAGES}
        value={language}
        onSelect={(value) => onLanguageChange(value as SnippetLanguage)}
      />
      <CodeBlock
        aria-label="Request snippet"
        copyable
        language={language === "curl" ? "shell" : "javascript"}
        lineNumbers
      >
        {snippet}
      </CodeBlock>
    </section>
  );
}
