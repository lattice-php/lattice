<?php
declare(strict_types=1);

namespace Lattice\Core\JsonSchema;

use LogicException;

/**
 * Merges a set of already-flat, self-contained schema documents (each
 * `FlatProjection`-processed, so none of them point outside themselves) into
 * one: every def name lands directly in the merged `$defs`, keeping `$base`'s
 * `$schema`/`$id`/`title`/`x-lattice`. Every flat document carries its own
 * copy of the envelope core, so the same name recurs across documents with
 * byte-identical content — those collapse silently.
 *
 * Two different classes may declare the SAME wire type (`#[AsFilter]`/
 * `#[AsComponent]` reusing an existing control's type string, e.g. a
 * component package's filter opting into the built-in `filter.select`
 * control) — their `strict` node-envelope defs then collide on the same
 * `prefix:type` name with genuinely different content. That is a pre-existing
 * property of the wire model (present before this fan-out), not something
 * this merge can adjudicate, so it keeps whichever document is processed
 * first — deterministic given a stable source order — instead of failing the
 * build. Any OTHER kind of name collision is a real bug (e.g. two unrelated
 * classes accidentally sharing a `class_basename()`) and still throws.
 */
final readonly class SchemaBundler
{
    /**
     * @param  array<string, mixed>  $base
     * @param  list<array<string, mixed>>  $documents
     * @return array<string, mixed>
     */
    public function bundle(array $base, array $documents): array
    {
        $defs = $base['$defs'] ?? [];

        foreach ($documents as $document) {
            foreach ($document['$defs'] ?? [] as $name => $def) {
                if (isset($defs[$name]) && $defs[$name] !== $def) {
                    if (($defs[$name]['x-lattice']['kind'] ?? null) === 'strict' && ($def['x-lattice']['kind'] ?? null) === 'strict') {
                        continue;
                    }

                    throw new LogicException(sprintf(
                        'Schema definition name [%s] is claimed by two different defs while merging the wire-protocol bundle.',
                        $name,
                    ));
                }

                $defs[$name] = $def;
            }
        }

        ksort($defs);
        $base['$defs'] = $defs;

        return $base;
    }
}
