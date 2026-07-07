<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Lattice\Lattice\Effects\Contracts\Effect as EffectContract;
use Lattice\Lattice\Effects\EffectRegistry;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Lattice\Lattice\Support\TypeScript\ComponentTransformer;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Lattice\Support\TypeScript\TypeScriptGenerator;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;
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

        $effects = $this->discoverEffects();
        $marked = (new MarkedTypeDiscovery)->discover($src);

        $discovered = (new ComponentDiscovery)->discover($src);
        $columnProps = $this->buildColumnProps($discovered);

        $formFields = $this->buildFormFields($discovered);
        $domainNodes = $this->buildDomainNodes($discovered);

        $generator->generate(
            [$src],
            [
                new HttpMethodTransformer,
                new EnumTransformer($marked['enums']),
                new ValueObjectTransformer([
                    ...$marked['valueObjects'],
                    ...array_keys($effects),
                ]),
                new ComponentTransformer([
                    ...array_keys($formFields),
                    Form::class,
                    ...$this->componentClasses($domainNodes),
                    ...array_values($columnProps),
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
                ),
            ],
            new FlatModuleWriter('generated.ts'),
            $packageRoot.'/resources/js/types',
            new OxfmtFormatter,
        );

        return 'Regenerated built-in TypeScript types.';
    }

    /**
     * Effect value objects keyed by class-string, valued by wire type — for the
     * allow-list and the generated `Effect` union.
     *
     * This profile generates the package's OWN built-in types only, so it builds
     * a fresh registry over src/Effects/Builtin rather than resolving the
     * container singleton: a consumer app's runtime-registered effects must not
     * leak into the package's generated.ts. Typed augmentation of consumer
     * effects is the AugmentProfile's job (deferred — see the effects-domain spec).
     *
     * @return array<class-string, string>
     */
    private function discoverEffects(): array
    {
        return array_flip(EffectRegistry::withBuiltins()->all());
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
