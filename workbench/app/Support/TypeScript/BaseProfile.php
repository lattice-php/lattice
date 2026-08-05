<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Illuminate\Support\Str;
use Lattice\Core\Attributes\WireEnvelope;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorKind;
use Lattice\Core\Enums\Op;
use Lattice\Core\LatticeRegistry;
use Lattice\Core\Option;
use Lattice\Core\Support\Affix;
use Lattice\Form\Components\Form;
use Lattice\Support\TypeScript\ComponentTransformer;
use Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Support\TypeScript\NodeModuleWriter;
use Lattice\Support\TypeScript\NodeTypeReference;
use Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Support\TypeScript\TypeScriptGenerator;
use Lattice\Support\TypeScript\TypeScriptProfile;
use Lattice\Support\TypeScript\WireTypeDiscovery;
use Lattice\Table\Columns\Column;
use Lattice\Table\Components\Table as TableComponent;
use Lattice\Table\Filters\Filter;
use Lattice\Ui\Enums\ColumnWidth;
use Lattice\Ui\Enums\DateTimeStyle;
use Lattice\Ui\Enums\Emphasis;
use Lattice\Ui\Enums\Justify;
use Lattice\Ui\Enums\NumberFormatUnit;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Variant;

/**
 * The package's own dev profile: regenerates the built-in TypeScript module
 * (generated.ts) from the package sources. Bound in the workbench so lattice:typescript rebuilds
 * the base types every consumer app then augments. Workbench-only, so this
 * build code never ships.
 */
final readonly class BaseProfile implements TypeScriptProfile
{
    public function __construct(
        private WireTypeDiscovery $discovery,
        private LatticeRegistry $lattice,
    ) {}

    public function pendingTypeCount(): int
    {
        return count($this->discovery->discover($this->sources(dirname(__DIR__, 4)))->components);
    }

    public function run(TypeScriptGenerator $generator): string
    {
        $packageRoot = dirname(__DIR__, 4);
        $sources = $this->sources($packageRoot);

        // Overridable so the snapshot test regenerates into a scratch dir instead
        // of rewriting the committed resources/js/types mid-suite.
        $configuredOutput = config('lattice.typescript.base_output');
        $outputDirectory = is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput
            : $packageRoot.'/resources/js/types';
        $formOutputDirectory = is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput.'/form'
            : $packageRoot.'/packages/form/resources/js';
        $tableOutputDirectory = is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput.'/table'
            : $packageRoot.'/packages/table/resources/js';

        $manifest = $this->discovery->discover($sources);

        $discovered = $manifest->components;
        $formFields = $this->buildFormFields($discovered);
        $domainNodes = $this->buildDomainNodes($discovered);

        $familyProps = [
            'column' => $this->buildComponentProps($discovered, 'column'),
            'filter' => $this->buildComponentProps($discovered, 'filter'),
        ];

        $markerRefs = [];

        foreach ($this->lattice->wireFamilies()->where('marker', true) as $family) {
            $markerRefs[$family->reference] = new NodeTypeReference(
                $this->buildClassTypes($discovered, $family->category),
                WireEnvelope::forClass($family->reference),
                attributeFallback: $family->category === 'component',
            );
        }
        $valueObjectClasses = $manifest->valueObjects;

        foreach ($this->lattice->wireFamilies()->where('marker', false) as $family) {
            $classes = $manifest->family($family->category);

            if ($classes === []) {
                continue;
            }

            $familyProps[$family->category] = array_flip($classes);
            $valueObjectClasses = [...$valueObjectClasses, ...array_keys($classes)];
        }

        $generator->generate(
            $sources,
            [
                new HttpMethodTransformer,
                new EnumTransformer($manifest->enums),
                new ValueObjectTransformer($valueObjectClasses, $markerRefs),
                new ComponentTransformer([
                    ...array_keys($formFields),
                    Form::class,
                    Column::class,
                    Filter::class,
                    ...$this->componentClasses($domainNodes),
                    ...array_values($familyProps['column']),
                    ...array_values($familyProps['filter']),
                ], $markerRefs),
            ],
            [
                new NodesProvider(
                    $formFields,
                    Form::class,
                    $domainNodes,
                    $this->lattice,
                    'form',
                    $familyProps,
                ),
            ],
            new NodeModuleWriter('generated.ts'),
            $outputDirectory,
            new OxfmtFormatter,
        );

        $tableEnums = array_values(array_filter(
            $manifest->enums,
            static fn (string $class): bool => str_starts_with($class, 'Lattice\\Table\\')
                || in_array($class, [ColorKind::class, Op::class, ColumnWidth::class, DateTimeStyle::class, NumberFormatUnit::class], true),
        ));
        $tableValueObjects = array_values(array_unique([
            ...array_filter(
                $manifest->valueObjects,
                static fn (string $class): bool => str_starts_with($class, 'Lattice\\Table\\'),
            ),
            Color::class,
            Option::class,
        ]));
        $tableNodes = ['TableNode' => $this->buildBucket($discovered, 'Table')];

        $generator->generate(
            $sources,
            [
                new HttpMethodTransformer,
                new EnumTransformer($tableEnums),
                new ValueObjectTransformer($tableValueObjects, $markerRefs),
                new ComponentTransformer([
                    TableComponent::class,
                    Column::class,
                    Filter::class,
                    ...array_values($familyProps['column']),
                    ...array_values($familyProps['filter']),
                ], $markerRefs),
            ],
            [
                new NodesProvider(
                    [],
                    null,
                    $tableNodes,
                    $this->lattice,
                    familyProps: array_intersect_key($familyProps, array_flip(['column', 'filter'])),
                ),
            ],
            new NodeModuleWriter(
                'generated.ts',
                'import type { Node } from "@lattice-php/core";'.PHP_EOL
                    .'import type { ColumnNode, FilterNode } from "./types";'.PHP_EOL.PHP_EOL,
            ),
            $tableOutputDirectory,
            new OxfmtFormatter,
        );

        $editorExtensions = array_flip($manifest->family('editor-extension'));
        $formEnums = array_values(array_filter(
            $manifest->enums,
            static fn (string $class): bool => str_starts_with($class, 'Lattice\\Form\\')
                || in_array($class, [Op::class, ColumnWidth::class, Emphasis::class, Justify::class, Orientation::class, Variant::class], true),
        ));
        $formValueObjects = array_values(array_unique([
            ...array_filter(
                $manifest->valueObjects,
                static fn (string $class): bool => str_starts_with($class, 'Lattice\\Form\\'),
            ),
            ...array_values($editorExtensions),
            Affix::class,
            Option::class,
        ]));

        $generator->generate(
            $sources,
            [
                new HttpMethodTransformer,
                new EnumTransformer($formEnums),
                new ValueObjectTransformer($formValueObjects, $markerRefs),
                new ComponentTransformer([...array_keys($formFields), Form::class], $markerRefs),
            ],
            [
                new NodesProvider(
                    $formFields,
                    Form::class,
                    [],
                    $this->lattice,
                    'form',
                    ['editor-extension' => $editorExtensions],
                ),
            ],
            new NodeModuleWriter(
                'generated.ts',
                'import type { Node } from "@lattice-php/core";'.PHP_EOL.PHP_EOL,
            ),
            $formOutputDirectory,
            new OxfmtFormatter,
        );

        return 'Regenerated built-in TypeScript types.';
    }

    /**
     * @return list<string>
     */
    private function sources(string $packageRoot): array
    {
        return [
            $packageRoot.'/src',
            $packageRoot.'/packages/core/src',
            $packageRoot.'/packages/form/src',
            $packageRoot.'/packages/table/src',
            $packageRoot.'/packages/ui/src',
        ];
    }

    /**
     * @param  list<DiscoveredComponent>  $discovered
     * @return array<class-string, string>
     */
    private function buildClassTypes(array $discovered, string $category): array
    {
        $map = [];

        foreach ($discovered as $dc) {
            if ($dc->category === $category) {
                $map[$dc->class] = $dc->type;
            }
        }

        return $map;
    }

    /**
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
            fn (DiscoveredComponent $dc): bool => $dc->domain === 'Form' && $dc->class !== Form::class,
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
                    && $dc->domain !== 'Form',
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
