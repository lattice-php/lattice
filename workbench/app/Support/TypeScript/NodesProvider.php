<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Support\TypeScript\WireFamily;
use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\References\CustomReference;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\TransformedProviders\TransformedProvider;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptAlias;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptLiteral;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptObject;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptString;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnion;

/**
 * Emits the type-level glue that ties wire `type` strings to their generated props:
 * a per-domain `…NodeType` string union (the client builds its typed node union
 * from it with `NodeUnionOf`), the `WireNode` alias of core's `Node`, the `NodeType`
 * union, and — per {@see WireFamily} — each family's augmentable `…PropsMap` plus
 * its loose union alias.
 *
 * @phpstan-type ComponentSpec array{type: string, container?: bool, interactive?: bool}
 */
final readonly class NodesProvider implements TransformedProvider
{
    private const string REFERENCE_KEY = 'lattice-nodes';

    /**
     * @param  array<class-string, string>  $formFields  Form field components keyed by class-string, valued by wire type.
     * @param  class-string  $formClass
     * @param  array<string, array<class-string, ComponentSpec>>  $domainNodes  Node-alias name (e.g. 'CoreNode') to its components, in emission order.
     * @param  array<string, array<string, class-string>>  $familyProps  Family category => (wire type => props class-string) for every non-component family.
     * @param  list<string>  $nodeTypeAliases  Node-alias names (e.g. 'ActionNode') whose per-domain `…Type` union a client consumes via `NodeUnionOf`; others are not emitted.
     */
    public function __construct(
        private array $formFields,
        private string $formClass,
        private array $domainNodes,
        private string $formType = 'form',
        private array $familyProps = [],
        private array $nodeTypeAliases = [],
    ) {}

    /**
     * @return array<Transformed>
     */
    public function provide(): array
    {
        $formFieldTypes = array_values($this->formFields);

        $transformed = [
            $this->alias('FormFieldNodeType', $this->typeUnion($formFieldTypes)),
            $this->alias('FormNodeType', $this->typeUnion([...$formFieldTypes, $this->formType])),
        ];

        foreach ($this->domainNodes as $nodeName => $components) {
            if (! in_array($nodeName, $this->nodeTypeAliases, true)) {
                continue;
            }

            $types = array_map(static fn (array $spec): string => $spec['type'], array_values($components));
            $transformed[] = $this->alias($nodeName.'Type', $this->typeUnion($types));
        }

        $transformed[] = $this->alias('WireNode', new TypeScriptIdentifier('Node'));
        $transformed[] = $this->alias('NodeType', $this->typeUnion(array_keys($this->componentClassesByType())));
        $transformed[] = $this->alias('ComponentPropsMap', $this->propsMap($this->componentClassesByType()));

        foreach (WireFamily::all() as $family) {
            if ($family->category === 'component') {
                continue;
            }

            $entries = $this->familyProps[$family->category] ?? [];

            if ($entries === []) {
                continue;
            }

            if ($family->looseAlias !== null && $family->reference !== null) {
                $transformed[] = new Transformed(
                    new TypeScriptAlias($family->looseAlias, $this->loosePayload()),
                    new ClassStringReference($family->reference),
                    [],
                );
            }

            $transformed[] = $this->alias($family->mapType, $this->propsMap($entries));
        }

        return $transformed;
    }

    /**
     * An augmentable props map (`{ type: Props }`), the built-in source consumed by
     * a `ResolveProps<…Props, …PropsMap, …>` resolver ({@see WireFamily}).
     *
     * @param  array<string, class-string>  $entries  wire type => the class whose generated type is its props
     */
    private function propsMap(array $entries): TypeScriptObject
    {
        $properties = [];

        foreach ($entries as $type => $class) {
            $properties[$type] = new TypeScriptProperty(
                $type,
                new TypeScriptReference(new ClassStringReference($class)),
            );
        }

        ksort($properties);

        return new TypeScriptObject(array_values($properties));
    }

    /**
     * A family's loose alias keeps the one wire envelope — `{type, props}` with
     * required props, like a node — while staying loose (typed resolution is its
     * props map's job) so lists and dispatch layers pass consumer types through
     * by `type`.
     */
    private function loosePayload(): TypeScriptObject
    {
        return new TypeScriptObject([
            new TypeScriptProperty('type', new TypeScriptString),
            new TypeScriptProperty('props', $this->looseProps()),
        ]);
    }

    /**
     * The client builds its typed node union from this string union with
     * `NodeUnionOf<…NodeType>`, so the generator no longer hand-assembles the
     * discriminated object unions itself.
     *
     * @param  list<string>  $types
     */
    private function typeUnion(array $types): TypeScriptUnion
    {
        sort($types);

        return new TypeScriptUnion(array_map(
            static fn (string $type): TypeScriptLiteral => new TypeScriptLiteral($type),
            $types,
        ));
    }

    private function looseProps(): TypeScriptGeneric
    {
        return new TypeScriptGeneric(
            new TypeScriptIdentifier('Record'),
            [new TypeScriptString, new TypeScriptIdentifier('unknown')],
        );
    }

    /**
     * Every component (form fields, the form, and each domain's components) keyed by
     * wire type, valued by the class whose generated type is its props.
     *
     * @return array<string, class-string>
     */
    private function componentClassesByType(): array
    {
        $map = [];

        foreach ($this->formFields as $class => $type) {
            $map[$type] = $class;
        }

        $map[$this->formType] = $this->formClass;

        foreach ($this->domainNodes as $components) {
            foreach ($components as $class => $spec) {
                $map[$spec['type']] = $class;
            }
        }

        return $map;
    }

    private function selfReference(string $name): CustomReference
    {
        return new CustomReference(self::REFERENCE_KEY, $name);
    }

    private function alias(string $name, TypeScriptNode $type): Transformed
    {
        return new Transformed(
            new TypeScriptAlias($name, $type),
            $this->selfReference($name),
            [],
        );
    }
}
