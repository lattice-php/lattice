<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

use LogicException;

/**
 * Dereferences a `JsonSchemaBuilder::buildAll()`/`buildRootDocument()` origin
 * document into a flat, self-contained projection: every `$ref` — local or
 * cross-document — is resolved against the full def universe and inlined in
 * place, so the committed artifact never points outside itself.
 *
 * The one structural exception is the recursive envelope core (`Node`,
 * `Schema`, and the other loose node/column/filter envelopes): a `Node`
 * cannot be inlined into itself, so those defs are copied into the
 * projection's own `$defs` once and referenced with an intra-document `$ref`.
 * The same treatment dynamically applies to any other def that turns out to
 * be part of a reference cycle, so a foreign cross-cycle never recurses
 * forever — it resolves as an intra-document `$ref` too.
 *
 * The document's own top-level `$defs` entries (its family props/common-props/
 * strict/value-object/enum defs — everything `buildAll()` already scoped to
 * this origin) always stay addressable under their own name, fully
 * dereferenced; nothing pulled in from elsewhere earns a standalone entry
 * unless a cycle forces it.
 */
final class FlatProjection
{
    private const array ENVELOPE_CORE = [
        'Node', 'ColumnNode', 'FilterNode', 'Effect', 'EditorExtension', 'Schema', 'CommonNodeProps',
    ];

    /** @var array<string, mixed> */
    private array $roots;

    /** @var array<string, mixed> */
    private array $universe;

    /** @var array<string, mixed> */
    private array $out;

    /** @var array<string, true> */
    private array $inProgress;

    /** @var array<string, true> */
    private array $cyclic;

    /**
     * @param  array<string, mixed>  $document
     * @param  array<string, mixed>  $universe  every def, from every origin, keyed by def name
     * @return array<string, mixed>
     */
    public function project(array $document, array $universe): array
    {
        $this->roots = $document['$defs'] ?? [];
        $this->universe = $universe;
        $this->out = [];
        $this->inProgress = [];
        $this->cyclic = [];

        $defs = [];

        foreach ($this->roots as $name => $def) {
            $defs[$name] = $this->walk($def);
        }

        $document['$defs'] = [...$this->out, ...$defs];
        ksort($document['$defs']);

        return $document;
    }

    private function walk(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if (is_string($value['$ref'] ?? null)) {
            $resolved = $this->resolve($this->nameFromRef($value['$ref']));

            foreach ($value as $key => $sibling) {
                if ($key !== '$ref') {
                    $resolved[$key] = $this->walk($sibling);
                }
            }

            return $resolved;
        }

        return array_map($this->walk(...), $value);
    }

    /**
     * @return array<string, mixed>
     */
    private function resolve(string $name): array
    {
        if (isset($this->roots[$name])) {
            return ['$ref' => '#/$defs/'.$name];
        }

        if (isset($this->out[$name])) {
            return ['$ref' => '#/$defs/'.$name];
        }

        if (isset($this->inProgress[$name])) {
            $this->cyclic[$name] = true;

            return ['$ref' => '#/$defs/'.$name];
        }

        if (in_array($name, self::ENVELOPE_CORE, true)) {
            $this->cyclic[$name] = true;
        }

        $walked = $this->walkDef($name);

        if (isset($this->cyclic[$name])) {
            $this->out[$name] = $walked;

            return ['$ref' => '#/$defs/'.$name];
        }

        return $walked;
    }

    private function walkDef(string $name): mixed
    {
        $def = $this->universe[$name] ?? throw new LogicException(sprintf(
            'Schema def [%s] is referenced but missing from the def universe.',
            $name,
        ));

        $this->inProgress[$name] = true;
        $walked = $this->walk($def);
        unset($this->inProgress[$name]);

        return $walked;
    }

    private function nameFromRef(string $ref): string
    {
        $position = strrpos($ref, '/$defs/');

        return $position === false ? $ref : substr($ref, $position + strlen('/$defs/'));
    }
}
