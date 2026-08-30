<?php
declare(strict_types=1);

namespace Lattice\Support\TypeScript;

use LogicException;

/**
 * Emits a TypeScript module from a wire-protocol schema document — the schema
 * is the only input, so the published artifact provably carries everything the
 * types need. Every export is a transliteration of a `$defs` entry or an
 * `x-lattice` catalog. Three ways to call it: `emitModule()` inlines the
 * hand-written envelope prelude (stubs/envelopes.ts) verbatim for a
 * self-contained single-document module; `emitScopedModule()` takes a custom
 * header instead of the prelude for a hand-curated `$defs` slice;
 * `emitPackageModule()` is `WireModelBuilder::buildAll()`'s counterpart — one
 * origin's own `$defs`, with every reference outside them resolved to a
 * generated `import type` header via `ImportResolver`. Output is oxfmt-clean
 * (two-space indent, 100-column union wrap).
 */
final class SchemaTypeScriptEmitter
{
    private const int PRINT_WIDTH = 100;

    /**
     * Envelope types owned by the prelude; their defs document the wire shape
     * for validators but must not be re-emitted.
     */
    public const array PRELUDE_DEFS = ['Node', 'ColumnNode', 'FilterNode', 'Schema', 'CommonNodeProps'];

    /**
     * Envelope generics with no generated form of their own: whichever
     * document's `$defs` references one by this bare name gets an `import
     * type` from this module instead — `emitPackageModule()`'s counterpart to
     * `PRELUDE_DEFS`. `Node`/`Schema`/`CommonNodeProps` are `@lattice-php/core`'s
     * hand-written `types.ts`; `ColumnNode`/`FilterNode` are table's own
     * hand-written `types.ts`, and `Effect` is ui's own hand-written,
     * augmentable `effects/types.ts` — all three use their package's npm
     * alias rather than a relative path, since a package's own document also
     * goes through this map (self-reference resolves identically through the
     * alias) and another package's document may reference the same marker
     * (e.g. a board `filters: Filter[]` property needs `FilterNode` from
     * table, not a `./types` relative to board's own generated.ts).
     *
     * @var array<string, string>
     */
    public const array MARKER_MODULES = [
        'Node' => '@lattice-php/core',
        'Schema' => '@lattice-php/core',
        'CommonNodeProps' => '@lattice-php/core',
        'ColumnNode' => '@lattice-php/table/types',
        'FilterNode' => '@lattice-php/table/types',
        'Effect' => '@lattice-php/ui/effects/types',
    ];

    /**
     * @var array<string, mixed>
     */
    private array $defs = [];

    /**
     * @var array<string, true>
     */
    private array $inlining = [];

    private ?ImportResolver $imports = null;

    /**
     * @var array<string, array<string, true>> module => (name => true)
     */
    private array $collectedImports = [];

    /**
     * @param  array<string, mixed>  $document
     */
    public function emitModule(array $document): string
    {
        $prelude = (string) file_get_contents(__DIR__.'/stubs/envelopes.ts');

        return $prelude.$this->emitBody($document);
    }

    /**
     * @param  array<string, mixed>  $document
     */
    public function emitScopedModule(array $document, string $header): string
    {
        return $header.$this->emitBody($document);
    }

    /**
     * One `WireModelBuilder::buildAll()` origin's own `generated.ts`: its own
     * `$defs` transliterated as usual, but every `$ref` outside those local
     * `$defs` becomes a cross-package `import type` (via `$imports`) instead
     * of a bare identifier or an inlined duplicate.
     *
     * @param  array<string, mixed>  $document
     */
    public function emitPackageModule(array $document, ImportResolver $imports): string
    {
        $this->imports = $imports;
        $this->collectedImports = [];

        $body = $this->emitBody($document);

        $this->imports = null;

        return $this->importHeader().$body;
    }

    /**
     * @param  array<string, mixed>  $document
     */
    private function emitBody(array $document): string
    {
        $this->defs = $document['$defs'];

        $exports = $this->exports($document);
        ksort($exports, SORT_STRING);

        $body = '';

        foreach ($exports as $name => $type) {
            $body .= $this->export($name, $type);
        }

        return $body;
    }

    private function importHeader(): string
    {
        if ($this->collectedImports === []) {
            return '';
        }

        ksort($this->collectedImports);
        $lines = '';

        foreach ($this->collectedImports as $module => $names) {
            $names = array_keys($names);
            sort($names);
            $lines .= sprintf('import type { %s } from "%s";'.PHP_EOL, implode(', ', $names), $module);
        }

        return $lines.PHP_EOL;
    }

    /**
     * Records that `emitPackageModule()`'s module needs `$name` imported —
     * a marker's hand-written home, or (via `$imports`) whichever origin's
     * document actually defines it. A no-op outside `emitPackageModule()`,
     * and for a name the local `$defs` already carries.
     */
    private function useIdentifier(string $name): void
    {
        if (! $this->imports instanceof ImportResolver || isset($this->defs[$name])) {
            return;
        }

        $module = self::MARKER_MODULES[$name] ?? null;

        if ($module === null) {
            $origin = $this->imports->originOf($name) ?? throw new LogicException(sprintf(
                'Referenced type [%s] belongs to no known wire source.',
                $name,
            ));
            $module = $this->imports->moduleFor($origin);
        }

        $this->collectedImports[$module][$name] = true;
    }

    /**
     * The consumer module augmentation: every `origin: "app"` props def keyed
     * by wire type under its family's augmentable interface. References to
     * built-in defs stay identifiers (they resolve against the module's own
     * exports inside `declare module`); references to other app defs are
     * inlined, since interface augmentation cannot add standalone types.
     *
     * @param  array<string, mixed>  $document
     */
    public function emitAugmentation(array $document, string $module): string
    {
        $this->defs = $document['$defs'];

        $entriesByCategory = [];

        foreach ($document['$defs'] as $def) {
            $annotation = $def['x-lattice'] ?? [];

            if (($annotation['origin'] ?? null) !== 'app' || ($annotation['kind'] ?? null) !== 'props') {
                continue;
            }

            $type = $annotation['wireType'];
            $entriesByCategory[$annotation['family']][$type] = sprintf(
                '    "%s": %s;',
                $type,
                $this->defType($def, 3),
            );
        }

        return AugmentationWriter::render($module, $entriesByCategory);
    }

    /**
     * Every export the module carries beyond the prelude: transliterated defs
     * plus the `…NodeType` unions and `…PropsMap` maps synthesized from the
     * document's catalogs.
     *
     * @param  array<string, mixed>  $document
     * @return array<string, string>
     */
    public function exports(array $document): array
    {
        $exports = [];

        foreach ($document['$defs'] as $name => $def) {
            if (! $this->emits($name, $def)) {
                continue;
            }

            $exports[$name] = $this->defType($def);
        }

        foreach ($document['x-lattice']['domains'] as $name => $types) {
            $exports[$name] = $this->union(array_values(array_map(
                fn (mixed $value): string => json_encode($value, JSON_THROW_ON_ERROR),
                $types,
            )));
        }

        foreach ($document['x-lattice']['families'] as $family) {
            if ($family['types'] === []) {
                continue;
            }

            $entries = [];

            foreach ($family['types'] as $type => $entry) {
                $entries[$type] = $this->refName($entry['props']);
            }

            $exports[$family['propsMap']] = $this->objectLiteral($entries, 1);
        }

        return $exports;
    }

    /**
     * @param  array<string, mixed>  $def
     */
    private function emits(string $name, array $def): bool
    {
        if (str_contains($name, ':') || in_array($name, self::PRELUDE_DEFS, true)) {
            return false;
        }

        return ! in_array($def['x-lattice']['kind'] ?? null, ['strict', 'union', 'remote'], true);
    }

    private function export(string $name, string $type): string
    {
        $single = sprintf('export type %s = %s;', $name, $type);

        if (! str_contains($type, "\n") && str_contains($type, ' | ') && strlen($single) > self::PRINT_WIDTH) {
            $members = explode(' | ', $type);

            return sprintf("export type %s =\n  | %s;\n", $name, implode("\n  | ", $members));
        }

        return $single."\n";
    }

    /**
     * @param  array<string, mixed>  $def
     */
    public function defType(array $def, int $indent = 1): string
    {
        if (($def['x-lattice']['kind'] ?? null) === 'enum') {
            return $this->union(array_values(array_map(
                fn (mixed $value): string => json_encode($value, JSON_THROW_ON_ERROR),
                $def['enum'],
            )));
        }

        return $this->type($this->withoutAnnotations($def), $indent);
    }

    /**
     * @param  array<string, mixed>  $fragment
     */
    private function type(array $fragment, int $indent): string
    {
        if (isset($fragment['$ref'])) {
            return $this->refName($fragment['$ref'], $indent);
        }

        if (isset($fragment['anyOf'])) {
            return $this->union(array_values(array_map(
                fn (array $member): string => $this->type($member, $indent),
                $fragment['anyOf'],
            )));
        }

        if (is_array($fragment['type'] ?? null)) {
            return $this->union(array_values(array_unique(array_map($this->scalar(...), $fragment['type']))));
        }

        return match ($fragment['type'] ?? null) {
            'array' => $this->arrayType($fragment, $indent),
            'object' => $this->objectType($fragment, $indent),
            null => 'unknown',
            default => $this->scalar($fragment['type']),
        };
    }

    /**
     * @param  array<string, mixed>  $fragment
     */
    private function arrayType(array $fragment, int $indent): string
    {
        if (! isset($fragment['items'])) {
            return 'unknown[]';
        }

        $itemsFragment = $this->asFragment($fragment['items']);
        $items = $this->type($itemsFragment, $indent);
        $union = isset($itemsFragment['anyOf'])
            || (is_array($itemsFragment['type'] ?? null) && str_contains($items, ' | '));

        return ($union ? '('.$items.')' : $items).'[]';
    }

    /**
     * @param  array<string, mixed>  $fragment
     */
    private function objectType(array $fragment, int $indent): string
    {
        if (array_key_exists('additionalProperties', $fragment)) {
            if ($fragment['additionalProperties'] === false) {
                return 'Record<string, never>';
            }

            $keys = ($fragment['x-lattice']['keys'] ?? null) === 'integer|string' ? 'string | number' : 'string';
            $value = $fragment['additionalProperties'] === true
                ? 'unknown'
                : $this->type($this->asFragment($fragment['additionalProperties']), $indent);

            return sprintf('Record<%s, %s>', $keys, $value);
        }

        if (! array_key_exists('properties', $fragment)) {
            return 'Record<string, unknown>';
        }

        $entries = [];

        foreach ($this->asFragment($fragment['properties']) as $name => $property) {
            $property = $this->asFragment($property);
            $readonly = ($property['readOnly'] ?? false) === true;
            unset($property['readOnly']);

            $entries[($readonly ? 'readonly ' : '').$name] = $this->propertyType($property, $indent + 1);
        }

        return $this->objectLiteral($entries, $indent);
    }

    /**
     * A property-position union renders like oxfmt: inline while every member
     * is single-line, hugging when the one multiline member is a bare object
     * literal, wrapped (one `| member` per line, members re-indented) otherwise.
     *
     * @param  array<string, mixed>  $fragment
     */
    private function propertyType(array $fragment, int $indent): string
    {
        if (! isset($fragment['anyOf'])) {
            return $this->type($fragment, $indent);
        }

        $members = array_map(
            fn (mixed $member): string => $this->type($this->asFragment($member), $indent),
            $fragment['anyOf'],
        );

        $multiline = array_filter($members, static fn (string $member): bool => str_contains($member, "\n"));

        $bareObject = count($multiline) === 1
            && str_starts_with(current($multiline), '{')
            && str_ends_with(current($multiline), '}');

        if ($multiline === [] || $bareObject) {
            return $this->union(array_values($members));
        }

        $pad = str_repeat('  ', $indent);
        $wrapped = array_map(
            fn (mixed $member): string => $this->type($this->asFragment($member), $indent + 2),
            $fragment['anyOf'],
        );

        return "\n".$pad.'| '.implode("\n".$pad.'| ', $wrapped);
    }

    /**
     * @param  array<string, string>  $entries  property name (optionally `readonly `-prefixed) => rendered type
     */
    public function objectLiteral(array $entries, int $indent): string
    {
        if ($entries === []) {
            return 'Record<string, never>';
        }

        $pad = str_repeat('  ', $indent);
        $lines = '';

        foreach ($entries as $name => $type) {
            $readonly = '';

            if (str_starts_with($name, 'readonly ')) {
                $readonly = 'readonly ';
                $name = substr($name, strlen('readonly '));
            }

            $key = preg_match('/^[A-Za-z_$][A-Za-z0-9_$]*$/', $name) === 1 ? $name : json_encode($name);
            $separator = str_starts_with($type, "\n") ? ':' : ': ';
            $lines .= sprintf("%s%s%s%s%s;\n", $pad, $readonly, $key, $separator, $type);
        }

        return "{\n".$lines.str_repeat('  ', $indent - 1).'}';
    }

    public function refName(string $pointer, int $indent = 1): string
    {
        $name = substr($pointer, strlen('#/$defs/'));

        [$prefix, $type] = str_contains($name, ':') ? explode(':', $name, 2) : [null, $name];

        $generic = match ($prefix) {
            null => null,
            'node' => 'Node',
            'column' => 'ColumnNode',
            'filter' => 'FilterNode',
            default => throw new LogicException(sprintf('Unexpected reference to [%s] in a prop type.', $name)),
        };

        if ($generic !== null) {
            $this->useIdentifier($generic);

            return sprintf('%s<"%s">', $generic, $type);
        }

        return $this->identifierOrInline($name, $indent);
    }

    /**
     * App-origin defs inline at their reference site (an augmentation cannot
     * export standalone types); anything else is a module-resolvable
     * identifier — cross-package for `emitPackageModule()` (`useIdentifier()`).
     * Cycles degrade to `unknown`.
     */
    private function identifierOrInline(string $name, int $indent): string
    {
        $def = $this->defs[$name] ?? null;

        if (! is_array($def) || (($def['x-lattice']['origin'] ?? null) !== 'app')) {
            $this->useIdentifier($name);

            return $name;
        }

        if (isset($this->inlining[$name])) {
            return 'unknown';
        }

        $this->inlining[$name] = true;

        try {
            return $this->defType($def, $indent);
        } finally {
            unset($this->inlining[$name]);
        }
    }

    private function scalar(string $type): string
    {
        return match ($type) {
            'integer' => 'number',
            'string', 'number', 'boolean', 'null' => $type,
            default => throw new LogicException(sprintf('Unexpected scalar type [%s].', $type)),
        };
    }

    /**
     * @param  list<string>  $members
     */
    public function union(array $members): string
    {
        return implode(' | ', $members);
    }

    /**
     * @param  array<string, mixed>  $def
     * @return array<string, mixed>
     */
    private function withoutAnnotations(array $def): array
    {
        unset($def['x-lattice']);

        return $def;
    }

    /**
     * @return array<string, mixed>
     */
    private function asFragment(mixed $value): array
    {
        return is_array($value) ? $value : [];
    }
}
