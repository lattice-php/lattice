<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\References\CustomReference;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\TransformedProviders\TransformedProvider;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptAlias;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptArray;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptGeneric;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIdentifier;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIntersection;
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
 * from it with `NodeUnionOf`), the loose `WireNode`/`Effect` wire shapes, the
 * `NodeType` union, and the augmentable `…PropsMap` maps ({@see AugmentableMap}).
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
     * @param  class-string|null  $effectContract
     * @param  array<class-string, string>  $effects  Effect value objects keyed by class-string, valued by wire type.
     * @param  array<string, class-string>  $columnProps  wire column type => props VO class-string
     */
    public function __construct(
        private array $formFields,
        private string $formClass,
        private array $domainNodes,
        private string $formType = 'form',
        private ?string $effectContract = null,
        private array $effects = [],
        private array $columnProps = [],
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
            $types = array_map(static fn (array $spec): string => $spec['type'], array_values($components));
            $transformed[] = $this->alias($nodeName.'Type', $this->typeUnion($types));
        }

        $transformed[] = $this->alias('WireNode', $this->wireNode());
        $transformed[] = $this->alias('NodeType', $this->typeUnion(array_keys($this->componentClassesByType())));
        $transformed[] = $this->alias('ComponentPropsMap', $this->propsMap($this->componentClassesByType()));

        if ($this->effectContract !== null && $this->effects !== []) {
            $transformed[] = new Transformed(
                new TypeScriptAlias('Effect', $this->looseEffect()),
                new ClassStringReference($this->effectContract),
                [],
            );
            $transformed[] = $this->alias('EffectPropsMap', $this->propsMap(array_flip($this->effects)));
        }

        if ($this->columnProps !== []) {
            $transformed[] = $this->alias('ColumnPropsMap', $this->propsMap($this->columnProps));
        }

        return $transformed;
    }

    /**
     * An augmentable props map (`{ type: Props }`), the built-in source consumed by
     * a `ResolveProps<…Props, …PropsMap, …>` resolver. Shared by components, columns
     * and effects — see {@see AugmentableMap}.
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
     * The loose wire shape an effect arrives in: a `type` discriminator plus an open
     * bag. Typed resolution goes through `EffectPropsMap`; `Effect[]` fields and the
     * dispatch layer stay open so consumer effects flow through by `type`.
     */
    private function looseEffect(): TypeScriptIntersection
    {
        return new TypeScriptIntersection([
            new TypeScriptObject([new TypeScriptProperty('type', new TypeScriptString)]),
            $this->looseProps(),
        ]);
    }

    /**
     * A union of wire-type string literals. Domains build their typed node union
     * from this on the client with `NodeUnionOf<…NodeType>`, so the generator no
     * longer hand-assembles discriminated object unions here.
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

    /**
     * The loose wire shape every node arrives in: a `type` discriminator plus an
     * open props bag. The typed `Node<TType>` in core/types resolves props per type
     * through `ComponentPropsMap`; this is what `Component`-typed fields serialize as.
     */
    private function wireNode(): TypeScriptObject
    {
        return new TypeScriptObject([
            new TypeScriptProperty('id', new TypeScriptString, isOptional: true),
            new TypeScriptProperty('key', new TypeScriptString, isOptional: true),
            new TypeScriptProperty('type', new TypeScriptString),
            new TypeScriptProperty('props', $this->looseProps(), isOptional: true),
            new TypeScriptProperty(
                'schema',
                new TypeScriptArray([new TypeScriptReference($this->selfReference('WireNode'))]),
                isOptional: true,
            ),
        ]);
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

    public static function wireNodeReference(): CustomReference
    {
        return new CustomReference(self::REFERENCE_KEY, 'WireNode');
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
