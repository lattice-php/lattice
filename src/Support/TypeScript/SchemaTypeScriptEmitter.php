<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use LogicException;

/**
 * Emits the TypeScript module from the wire-protocol schema document — the
 * schema is the only input, so the published artifact provably carries
 * everything the types need. The hand-written envelope prelude
 * (stubs/envelopes.ts) is inlined verbatim; every other export is a
 * transliteration of a `$defs` entry or an `x-lattice` catalog. Output is
 * oxfmt-clean (two-space indent, 100-column union wrap).
 */
final class SchemaTypeScriptEmitter
{
    private const int PRINT_WIDTH = 100;

    /**
     * Envelope types owned by the prelude; their defs document the wire shape
     * for validators but must not be re-emitted.
     */
    private const array PRELUDE_DEFS = ['Node', 'ColumnNode', 'FilterNode', 'Schema', 'CommonNodeProps'];

    /**
     * @var array<string, mixed>
     */
    private array $defs = [];

    /**
     * @var array<string, true>
     */
    private array $inlining = [];

    /**
     * @param  array<string, mixed>  $document
     */
    public function emitModule(array $document): string
    {
        $this->defs = $document['$defs'];

        $prelude = (string) file_get_contents(__DIR__.'/stubs/envelopes.ts');

        $exports = $this->exports($document);
        ksort($exports, SORT_STRING);

        $body = '';

        foreach ($exports as $name => $type) {
            $body .= $this->export($name, $type);
        }

        return $prelude.$body;
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
            $exports[$name] = $this->union(array_map(json_encode(...), $types));
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
    private function defType(array $def, int $indent = 1): string
    {
        if (($def['x-lattice']['kind'] ?? null) === 'enum') {
            return $this->union(array_map(json_encode(...), $def['enum']));
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
            return $this->union(array_map(
                fn (array $member): string => $this->type($member, $indent),
                $fragment['anyOf'],
            ));
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
            return $this->union($members);
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
    private function objectLiteral(array $entries, int $indent): string
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

    private function refName(string $pointer, int $indent = 1): string
    {
        $name = substr($pointer, strlen('#/$defs/'));

        [$prefix, $type] = str_contains($name, ':') ? explode(':', $name, 2) : [null, $name];

        return match ($prefix) {
            null => $this->identifierOrInline($name, $indent),
            'node' => sprintf('Node<"%s">', $type),
            'column' => sprintf('ColumnNode<"%s">', $type),
            'filter' => sprintf('FilterNode<"%s">', $type),
            default => throw new LogicException(sprintf('Unexpected reference to [%s] in a prop type.', $name)),
        };
    }

    /**
     * App-origin defs inline at their reference site (an augmentation cannot
     * export standalone types); anything else is a module-resolvable
     * identifier. Cycles degrade to `unknown`.
     */
    private function identifierOrInline(string $name, int $indent): string
    {
        $def = $this->defs[$name] ?? null;

        if (! is_array($def) || (($def['x-lattice']['origin'] ?? null) !== 'app')) {
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
    private function union(array $members): string
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
