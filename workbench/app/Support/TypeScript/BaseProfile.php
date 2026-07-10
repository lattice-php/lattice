<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Illuminate\Support\Str;
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
            $outputDirectory,
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
