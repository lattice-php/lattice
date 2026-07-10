<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Support\TypeScript\ComponentTransformer;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Lattice\Support\TypeScript\TypeScriptGenerator;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;
use Lattice\Lattice\Support\TypeScript\WireTypeDiscovery;
use Spatie\TypeScriptTransformer\Writers\FlatModuleWriter;

/**
 * The package's own dev profile: regenerates the built-in TypeScript module
 * (generated.ts) from src/. Bound in the workbench so lattice:typescript rebuilds
 * the base types every consumer app then augments. Workbench-only, so this
 * build code never ships.
 */
final class BaseProfile implements TypeScriptProfile
{
    /**
     * Component domains in output order, mapped to their node-alias name. The
     * order and (singular) names are meaningful, so they stay declared here.
     */
    private const array DOMAIN_NODES = [
        'Core' => 'CoreNode',
        'Actions' => 'ActionNode',
        'Fragments' => 'FragmentNode',
        'Remote' => 'RemoteNode',
        'Tables' => 'TableNode',
        'Layouts' => 'LayoutNode',
        'Chat' => 'ChatNode',
        'Notifications' => 'NotificationNode',
    ];

    /**
     * Node aliases whose per-domain `…Type` string union a client actually consumes
     * (via `NodeUnionOf`). Only these are emitted — the rest would be dead exports.
     * Add one here when a client starts deriving a node union for that domain.
     */
    private const array NODE_TYPE_ALIASES = ['ActionNode'];

    /**
     * The component domains this profile emits a node type for. Exposed so the
     * drift-guard test can assert no src/ domain is missing from the hand-list —
     * an unregistered domain's components would silently vanish from the generated
     * `ComponentPropsMap`/`NodeType`.
     *
     * @return list<string>
     */
    public static function domainNodeNames(): array
    {
        return array_keys(self::DOMAIN_NODES);
    }

    public function run(TypeScriptGenerator $generator): string
    {
        $packageRoot = dirname(__DIR__, 4);
        $src = $packageRoot.'/src';

        $manifest = new WireTypeDiscovery()->discover($src);
        $effects = $manifest->effects;

        $discovered = $manifest->components;
        $columnProps = $this->buildColumnProps($discovered);
        $filterProps = $this->buildFilterProps($discovered);

        $formFields = $this->buildFormFields($discovered);
        $domainNodes = $this->buildDomainNodes($discovered);

        $generator->generate(
            [$src],
            [
                new HttpMethodTransformer,
                new EnumTransformer($manifest->enums),
                new ValueObjectTransformer([
                    ...$manifest->valueObjects,
                    ...array_keys($effects),
                ]),
                new ComponentTransformer([
                    ...array_keys($formFields),
                    Form::class,
                    ...$this->componentClasses($domainNodes),
                    ...array_values($columnProps),
                    ...array_values($filterProps),
                ]),
            ],
            [
                new NodesProvider(
                    $formFields,
                    Form::class,
                    $domainNodes,
                    'form',
                    EffectContract::class,
                    $effects,
                    $columnProps,
                    $filterProps,
                    self::NODE_TYPE_ALIASES,
                ),
            ],
            new FlatModuleWriter('generated.ts'),
            $packageRoot.'/resources/js/types',
            new OxfmtFormatter,
        );

        return 'Regenerated built-in TypeScript types.';
    }

    /**
     * Built-in column classes keyed by wire column type. A column reflects its
     * public properties into its props, exactly like a component, so the column
     * class itself is the source of the generated props type.
     *
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<string, class-string>
     */
    private function buildColumnProps(array $discovered): array
    {
        $columns = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => $dc->category === 'column',
        );

        $map = [];

        foreach ($columns as $dc) {
            $map[$dc->type] = $dc->class;
        }

        return $map;
    }

    /**
     * Built-in filter classes keyed by wire filter type. A filter reflects its
     * public properties into its props, exactly like a component, so the filter
     * class itself is the source of the generated props type.
     *
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<string, class-string>
     */
    private function buildFilterProps(array $discovered): array
    {
        $filters = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => $dc->category === 'filter',
        );

        $map = [];

        foreach ($filters as $dc) {
            $map[$dc->type] = $dc->class;
        }

        return $map;
    }

    /**
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<class-string, string>
     */
    private function buildFormFields(array $discovered): array
    {
        $fields = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => $dc->domain === 'Forms' && $dc->class !== Form::class,
        );

        usort($fields, fn (DiscoveredComponent $a, DiscoveredComponent $b): int => $a->type <=> $b->type);

        return array_column(
            array_map(fn (DiscoveredComponent $dc): array => [$dc->class, $dc->type], $fields),
            1,
            0,
        );
    }

    /**
     * The components for each domain, keyed by node-alias name in DOMAIN_NODES order.
     *
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<string, array<class-string, array{type: string, container?: bool, interactive?: bool}>>
     */
    private function buildDomainNodes(array $discovered): array
    {
        $domainNodes = [];

        foreach (self::DOMAIN_NODES as $domain => $nodeName) {
            $domainNodes[$nodeName] = $this->buildBucket($discovered, $domain);
        }

        return $domainNodes;
    }

    /**
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<class-string, array{type: string, container?: bool, interactive?: bool}>
     */
    private function buildBucket(array $discovered, string $domain): array
    {
        $components = array_filter(
            $discovered,
            fn (DiscoveredComponent $dc): bool => $dc->domain === $domain,
        );

        usort($components, fn (DiscoveredComponent $a, DiscoveredComponent $b): int => $a->type <=> $b->type);

        $result = [];

        foreach ($components as $dc) {
            $spec = ['type' => $dc->type];

            if ($dc->container) {
                $spec['container'] = true;
            }

            if ($dc->interactive) {
                $spec['interactive'] = true;
            }

            $result[$dc->class] = $spec;
        }

        return $result;
    }

    /**
     * Flatten the per-domain component class-strings into one allow-list.
     *
     * @param  array<string, array<class-string, array{type: string, container?: bool, interactive?: bool}>>  $domainNodes
     * @return list<class-string>
     */
    private function componentClasses(array $domainNodes): array
    {
        $classes = [];

        foreach ($domainNodes as $components) {
            $classes = [...$classes, ...array_keys($components)];
        }

        return $classes;
    }
}
