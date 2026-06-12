<?php

declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Spatie\TypeScriptTransformer\References\ClassStringReference;
use Spatie\TypeScriptTransformer\References\CustomReference;
use Spatie\TypeScriptTransformer\References\Reference;
use Spatie\TypeScriptTransformer\Transformed\Transformed;
use Spatie\TypeScriptTransformer\TransformedProviders\TransformedProvider;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptAlias;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptArray;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIndexedAccess;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptIntersection;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptLiteral;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptNode;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptObject;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptProperty;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptReference;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptString;
use Spatie\TypeScriptTransformer\TypeScriptNodes\TypeScriptUnion;

/**
 * Emits the discriminated node unions that tie each component's wire `type`
 * string to its generated props type, one union per domain plus a shared `Node`
 * union. Members are built from typed TypeScript nodes so the props/schema
 * references are linked to their generated types rather than emitted as raw text.
 *
 * @phpstan-type ComponentSpec array{type: string, container?: bool, interactive?: bool}
 */
final class NodesProvider implements TransformedProvider
{
    private const REFERENCE_KEY = 'lattice-nodes';

    /**
     * @param  array<class-string, string>  $formFields  Form field components keyed by class-string, valued by wire type.
     * @param  class-string  $formClass
     * @param  array<string, array<class-string, ComponentSpec>>  $domainNodes  Node-alias name (e.g. 'CoreNode') to its components, in emission order.
     * @param  class-string|null  $effectContract
     * @param  array<class-string, string>  $effects  Effect value objects keyed by class-string, valued by wire type.
     * @param  array<string, class-string>  $columnProps  wire column type => props VO class-string
     */
    public function __construct(
        private readonly array $formFields,
        private readonly string $formClass,
        private readonly array $domainNodes,
        private readonly string $formType = 'form',
        private readonly ?string $effectContract = null,
        private readonly array $effects = [],
        private readonly array $columnProps = [],
    ) {}

    /**
     * @return array<Transformed>
     */
    public function provide(): array
    {
        $transformed = [
            $this->alias('FormFieldNode', $this->formFieldUnion()),
            $this->alias('FormNode', $this->formNodeUnion()),
            $this->alias('FormNodeType', $this->typeAccess('FormNode')),
        ];

        foreach ($this->domainNodes as $nodeName => $components) {
            $transformed[] = $this->alias($nodeName, $this->componentsUnion($components));
        }

        $transformed[] = $this->alias('Node', $this->nodeUnion());
        $transformed[] = $this->alias('NodeType', $this->typeAccess('Node'));

        if ($this->effectContract !== null && $this->effects !== []) {
            $transformed[] = new Transformed(
                new TypeScriptAlias('Effect', $this->effectUnion()),
                new ClassStringReference($this->effectContract),
                [],
            );
        }

        if ($this->columnProps !== []) {
            $transformed[] = $this->alias('ColumnPropsMap', $this->columnPropsMap());
        }

        return $transformed;
    }

    private function columnPropsMap(): TypeScriptObject
    {
        $properties = [];

        foreach ($this->columnProps as $type => $class) {
            $properties[$type] = new TypeScriptProperty(
                $type,
                new TypeScriptReference(new ClassStringReference($class)),
            );
        }

        ksort($properties);

        return new TypeScriptObject(array_values($properties));
    }

    private function effectUnion(): TypeScriptUnion
    {
        $members = [];

        foreach ($this->effects as $class => $type) {
            $members[$type] = new TypeScriptIntersection([
                new TypeScriptObject([
                    new TypeScriptProperty('type', new TypeScriptLiteral($type)),
                ]),
                new TypeScriptReference(new ClassStringReference($class)),
            ]);
        }

        ksort($members);

        return new TypeScriptUnion(array_values($members));
    }

    private function formFieldUnion(): TypeScriptUnion
    {
        $members = [];

        foreach ($this->formFields as $class => $type) {
            $members[] = $this->member($type, new ClassStringReference($class), false, false);
        }

        return new TypeScriptUnion($members);
    }

    private function formNodeUnion(): TypeScriptUnion
    {
        return new TypeScriptUnion([
            new TypeScriptReference($this->selfReference('FormFieldNode')),
            $this->member($this->formType, new ClassStringReference($this->formClass), true, true),
        ]);
    }

    /**
     * @param  array<class-string, ComponentSpec>  $components
     */
    private function componentsUnion(array $components): TypeScriptUnion
    {
        $members = [];

        foreach ($components as $class => $spec) {
            $members[] = $this->member(
                $spec['type'],
                new ClassStringReference($class),
                $spec['interactive'] ?? false,
                $spec['container'] ?? false,
            );
        }

        return new TypeScriptUnion($members);
    }

    private function nodeUnion(): TypeScriptUnion
    {
        return new TypeScriptUnion(array_map(
            fn (string $name): TypeScriptReference => new TypeScriptReference($this->selfReference($name)),
            ['FormNode', ...array_keys($this->domainNodes)],
        ));
    }

    private function member(string $type, Reference $propsReference, bool $interactive, bool $container): TypeScriptObject
    {
        $properties = [
            new TypeScriptProperty('type', new TypeScriptLiteral($type)),
            new TypeScriptProperty('key', new TypeScriptString, isOptional: true),
        ];

        if ($interactive) {
            $properties[] = new TypeScriptProperty('id', new TypeScriptString, isOptional: true);
        }

        $properties[] = new TypeScriptProperty('props', new TypeScriptReference($propsReference));

        if ($container) {
            $properties[] = new TypeScriptProperty(
                'schema',
                new TypeScriptArray([new TypeScriptReference($this->selfReference('Node'))]),
                isOptional: true,
            );
        }

        return new TypeScriptObject($properties);
    }

    private function typeAccess(string $name): TypeScriptIndexedAccess
    {
        return new TypeScriptIndexedAccess(
            new TypeScriptReference($this->selfReference($name)),
            [new TypeScriptLiteral('type')],
        );
    }

    public static function nodeReference(): CustomReference
    {
        return new CustomReference(self::REFERENCE_KEY, 'Node');
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
