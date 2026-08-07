<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

/**
 * Assembles the canonical full-protocol document as a JSON Schema 2020-12
 * bundle (§9.3.2 embedded schema resources) of per-package documents: the
 * framework ("lattice") document is the top level, every other source's
 * document is embedded under `$defs/{shortName}` retaining its own `$id` so
 * the cross-document `$refs` `JsonSchemaBuilder::buildAll()` wrote resolve
 * inside the bundle.
 *
 * Every non-root source's document is read from its COMMITTED
 * `WireSource::schemaPath()` file — never reflected here — so a consumer
 * app assembling its bundle never touches vendor PHP; only the root/app's
 * own document (built fresh by the caller) is reflected at bundle time.
 */
final readonly class SchemaBundler
{
    /**
     * @param  list<WireSource>  $sources  every wire source, including the root if the app declares one
     * @param  array<string, mixed>  $rootDocument  the root/app's own freshly-built document; `[]` when there is no root source
     * @param  array<string, mixed>|null  $frameworkDocument  the framework's own freshly-built document, when the
     *                                                        caller already has it in memory (the workbench regenerating
     *                                                        every document in one pass) — its committed file is the
     *                                                        bundle's own output path, so re-reading it from disk mid-run
     *                                                        would race the write; `null` reads it from disk like any
     *                                                        other installed source (the consumer-app path).
     * @return array<string, mixed>
     */
    public function bundle(array $sources, array $rootDocument, ?array $frameworkDocument = null): array
    {
        $bundle = $frameworkDocument;
        $embedded = [];

        foreach ($sources as $source) {
            if ($source->shortName === 'lattice' && ! $source->isRoot) {
                continue;
            }

            $document = $source->isRoot ? $rootDocument : $this->committedDocument($source);

            if ($document === null || $document === []) {
                continue;
            }

            $embedded[$source->shortName] = $document;
        }

        if ($bundle === null) {
            $lattice = collect($sources)->first(static fn (WireSource $source): bool => $source->shortName === 'lattice' && ! $source->isRoot);
            $bundle = $lattice !== null ? $this->committedDocument($lattice) : null;
        }

        $bundle ??= ['$schema' => 'https://json-schema.org/draft/2020-12/schema', '$defs' => []];
        $bundle['$defs'] = [...($bundle['$defs'] ?? []), ...$embedded];
        ksort($bundle['$defs']);

        return $bundle;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function committedDocument(WireSource $source): ?array
    {
        $path = $source->schemaPath();
        clearstatcache(true, $path);

        if (! is_file($path)) {
            return null;
        }

        $decoded = json_decode((string) file_get_contents($path), true);

        return is_array($decoded) ? $decoded : null;
    }
}
