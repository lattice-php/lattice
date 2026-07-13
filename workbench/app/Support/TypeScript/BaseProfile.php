<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Illuminate\Support\Str;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Support\TypeScript\ComponentTransformer;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Support\TypeScript\NodeModuleWriter;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Lattice\Support\TypeScript\TypeScriptGenerator;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;
use Lattice\Lattice\Support\TypeScript\WireFamily;
use Lattice\Lattice\Support\TypeScript\WireTypeDiscovery;

/**
 * The package's own dev profile: regenerates the built-in TypeScript module
 * (generated.ts) from src/. Bound in the workbench so lattice:typescript rebuilds
 * the base types every consumer app then augments. Workbench-only, so this
 * build code never ships.
 */
final class BaseProfile implements TypeScriptProfile
{
    /**
     * Node aliases whose per-domain `…Type` string union a client actually consumes
     * (via `NodeUnionOf`). Only these are emitted — the rest would be dead exports.
     * Add one here when a client starts deriving a node union for that domain.
     */
    private const array NODE_TYPE_ALIASES = ['ActionNode'];

    public function run(TypeScriptGenerator $generator): string
    {
        $packageRoot = dirname(__DIR__, 4);
        $src = $packageRoot.'/src';

        // Overridable so the snapshot test regenerates into a scratch dir instead
        // of rewriting the committed resources/js/types mid-suite.
        $configuredOutput = config('lattice.typescript.base_output');
        $outputDirectory = is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput
            : $packageRoot.'/resources/js/types';

        $manifest = new WireTypeDiscovery()->discover($src);

        $discovered = $manifest->components;
        $formFields = $this->buildFormFields($discovered);
        $domainNodes = $this->buildDomainNodes($discovered);

        $familyProps = [
            'column' => $this->buildComponentProps($discovered, 'column'),
            'filter' => $this->buildComponentProps($discovered, 'filter'),
        ];
        $valueObjectTransformers = [new ValueObjectTransformer($manifest->valueObjects)];

        foreach (WireFamily::attributeFamilies() as $family) {
            $classes = $manifest->family($family->category);

            if ($classes === []) {
                continue;
            }

            $familyProps[$family->category] = array_flip($classes);
            $valueObjectTransformers[] = new ValueObjectTransformer(array_keys($classes), namePrefix: $family->typeNamePrefix);
        }

        $generator->generate(
            [$src],
            [
                new HttpMethodTransformer,
                new EnumTransformer($manifest->enums),
                ...$valueObjectTransformers,
                new ComponentTransformer([
                    ...array_keys($formFields),
                    Form::class,
                    ...$this->componentClasses($domainNodes),
                    ...array_values($familyProps['column']),
                    ...array_values($familyProps['filter']),
                ]),
            ],
            [
                new NodesProvider(
                    $formFields,
                    Form::class,
                    $domainNodes,
                    'form',
                    $familyProps,
                    self::NODE_TYPE_ALIASES,
                ),
            ],
            new NodeModuleWriter('generated.ts'),
            $outputDirectory,
            new OxfmtFormatter,
        );

        return 'Regenerated built-in TypeScript types.';
    }

    /**
     * Built-in classes of one component-sourced family (columns, filters) keyed
     * by wire type. Like a component, they reflect their public properties into
     * their props, so the class itself is the source of the generated props type.
     *
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<string, class-string>
     */
    private function buildComponentProps(array $discovered, string $category): array
    {
        $map = [];

        foreach ($discovered as $dc) {
            if ($dc->category === $category) {
                $map[$dc->type] = $dc->class;
            }
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
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<string, array<class-string, array{type: string, container?: bool, interactive?: bool}>>
     */
    private function buildDomainNodes(array $discovered): array
    {
        $domains = array_values(array_unique(array_map(
            static fn (DiscoveredComponent $dc): string => $dc->domain,
            array_filter(
                $discovered,
                static fn (DiscoveredComponent $dc): bool => $dc->category === 'component'
                    && $dc->domain !== ''
                    && $dc->domain !== 'Forms',
            ),
        )));

        sort($domains);

        $domainNodes = [];

        foreach ($domains as $domain) {
            $domainNodes[Str::singular($domain).'Node'] = $this->buildBucket($discovered, $domain);
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
            fn (DiscoveredComponent $dc): bool => $dc->domain === $domain && $dc->category === 'component',
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
