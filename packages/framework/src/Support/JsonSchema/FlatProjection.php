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
 * The recursive envelope core (`Node`, `Schema`, and the other loose node/
 * column/filter envelopes) cannot be inlined into itself, so those defs are
 * copied into the projection's own `$defs` once and referenced with an
 * intra-document `$ref`. Every `props`/`common-props`/`strict` def (a
 * component/column/filter/effect/editor-extension's own props def, or its
 * `node:button`-style strict wire-type envelope) gets the same copy-once
 * treatment rather than full inlining: it is a reusable, independently
 * addressable identity referenced from a strict union or a nullable
 * node-typed prop, and inlining it in place would duplicate its entire
 * (possibly large) props tree at every use site.
 *
 * Once a copy-once def is pulled in from a foreign origin, any OTHER def it
 * references that is native to that SAME foreign origin (`$defOrigins`, e.g.
 * a component's props def and a value object it embeds, both owned by the
 * same wire package) gets the same copy-once treatment too, even though its
 * own kind (`value-object`/`enum`) would normally get it inlined — because
 * the very same def is independently pulled in by every document that
 * references it, and those copies are later merged back together
 * (`SchemaBundler`); a same-origin sibling must render byte-identically
 * everywhere it is reached, which only a stable, origin-aware rule
 * guarantees. Anything reached that is NOT native to the currently active
 * origin (e.g. a plain enum from a third package) still inlines normally.
 *
 * The same copy-once treatment dynamically applies to any def that turns out
 * to be part of a reference cycle, so a foreign cross-cycle never recurses
 * forever — it resolves as an intra-document `$ref` too.
 *
 * The document's own top-level `$defs` entries (its family props/common-props/
 * strict/value-object/enum defs — everything `buildAll()` already scoped to
 * this origin) always stay addressable under their own name, fully
 * dereferenced; nothing pulled in from elsewhere earns a standalone entry
 * unless its kind or origin keeps it universally addressable, or a cycle
 * forces it.
 */
final class FlatProjection
{
    private const array ENVELOPE_CORE = [
        'Node', 'ColumnNode', 'FilterNode', 'Effect', 'EditorExtension', 'Schema', 'CommonNodeProps',
    ];

    private const array COPY_ONCE_KINDS = ['props', 'common-props', 'strict'];

    /** @var array<string, mixed> */
    private array $roots;

    /** @var array<string, mixed> */
    private array $universe;

    /** @var array<string, string> */
    private array $defOrigins;

    /** @var array<string, mixed> */
    private array $out;

    /** @var array<string, true> */
    private array $inProgress;

    /** @var array<string, true> */
    private array $cyclic;

    private ?string $currentOrigin = null;

    /**
     * @param  array<string, mixed>  $document
     * @param  array<string, mixed>  $universe  every def, from every origin, keyed by def name
     * @param  array<string, string>  $defOrigins  def name => owning origin's shortName, covering the full universe
     * @param  string|null  $documentOrigin  this document's own origin shortName, for same-origin sibling tracking
     * @return array<string, mixed>
     */
    public function project(array $document, array $universe, array $defOrigins = [], ?string $documentOrigin = null): array
    {
        $this->roots = $document['$defs'] ?? [];
        $this->universe = $universe;
        $this->defOrigins = $defOrigins;
        $this->out = [];
        $this->inProgress = [];
        $this->cyclic = [];
        $this->currentOrigin = $documentOrigin;

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

        if (isset($this->inProgress[$name])) {
            $this->cyclic[$name] = true;

            return ['$ref' => '#/$defs/'.$name];
        }

        // Whether a def "stays addressable" is either universal (envelope
        // core, or a props/common-props/strict kind — always true, safe to
        // memoize in $out regardless of who is asking) or context-dependent
        // (a same-origin sibling of whatever is CURRENTLY being walked). The
        // $out memo only applies once we know which one this is: reusing it
        // unconditionally would let an earlier, differently-origined walk
        // that promoted this name to copy-once silently leak into a walk
        // that would otherwise correctly inline it here.
        $addressable = $this->staysAddressable($name);

        if ($addressable && isset($this->out[$name])) {
            return ['$ref' => '#/$defs/'.$name];
        }

        $walked = $this->walkDef($name);

        // `cyclic` only communicates a dynamically detected reentry up to the
        // walkDef() frame that is still in progress for it; once consumed it
        // must not linger; the previous "addressable" flag on the SAME name
        // may legitimately differ (false) the next time an unrelated,
        // differently-origined caller resolves it.
        $reentered = isset($this->cyclic[$name]);
        unset($this->cyclic[$name]);

        if ($addressable || $reentered) {
            $this->out[$name] = $walked;

            return ['$ref' => '#/$defs/'.$name];
        }

        return $walked;
    }

    private function staysAddressable(string $name): bool
    {
        if (in_array($name, self::ENVELOPE_CORE, true) || $this->isCopyOnceKind($name)) {
            return true;
        }

        return $this->currentOrigin !== null && ($this->defOrigins[$name] ?? null) === $this->currentOrigin;
    }

    private function walkDef(string $name): mixed
    {
        $def = $this->universe[$name] ?? throw new LogicException(sprintf(
            'Schema def [%s] is referenced but missing from the def universe.',
            $name,
        ));

        $previousOrigin = $this->currentOrigin;
        $this->currentOrigin = $this->defOrigins[$name] ?? $previousOrigin;

        $this->inProgress[$name] = true;
        $walked = $this->walk($def);
        unset($this->inProgress[$name]);

        $this->currentOrigin = $previousOrigin;

        return $walked;
    }

    private function isCopyOnceKind(string $name): bool
    {
        $def = $this->universe[$name] ?? null;
        $kind = is_array($def) ? $def['x-lattice']['kind'] ?? null : null;

        return in_array($kind, self::COPY_ONCE_KINDS, true);
    }

    private function nameFromRef(string $ref): string
    {
        $position = strrpos($ref, '/$defs/');

        return $position === false ? $ref : substr($ref, $position + strlen('/$defs/'));
    }
}
