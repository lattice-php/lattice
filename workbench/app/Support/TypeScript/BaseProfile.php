<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorKind;
use Lattice\Core\Enums\Op;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Option;
use Lattice\Core\Support\Affix;
use Lattice\Form\Components\Form;
use Lattice\Support\JsonSchema\JsonSchemaBuilder;
use Lattice\Support\JsonSchema\WireSourceCatalog;
use Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Support\TypeScript\SchemaTypeScriptEmitter;
use Lattice\Support\TypeScript\TypeScriptProfile;
use Lattice\Support\TypeScript\WireTypeDiscovery;
use Lattice\Table\Components\Table as TableComponent;
use Lattice\Ui\Enums\ColumnWidth;
use Lattice\Ui\Enums\DateTimeStyle;
use Lattice\Ui\Enums\Emphasis;
use Lattice\Ui\Enums\Justify;
use Lattice\Ui\Enums\ModalWidth;
use Lattice\Ui\Enums\NumberFormatUnit;
use Lattice\Ui\Enums\Orientation;
use Lattice\Ui\Enums\Side;
use Lattice\Ui\Enums\Variant;
use LogicException;

/**
 * The package's own dev profile: regenerates the built-in TypeScript modules
 * (framework's superset generated.ts plus each component package's own scoped
 * generated.ts) from the wire-protocol schema document. Bound in the workbench
 * so lattice:typescript rebuilds the base types every consumer app then
 * augments. Workbench-only, so this build code never ships.
 */
final readonly class BaseProfile implements TypeScriptProfile
{
    public function __construct(
        private WireTypeDiscovery $discovery,
        private WireSourceCatalog $catalog,
    ) {}

    public function run(): string
    {
        $packageRoot = dirname(__DIR__, 4);
        $sources = $this->catalog->builtinDirs(self::EMISSION_EXCLUDED);
        $document = new JsonSchemaBuilder()->build($sources);
        $manifest = $this->discovery->discover($sources);
        $discovered = $manifest->components;
        $emitter = new SchemaTypeScriptEmitter;
        $formatter = new OxfmtFormatter;

        $configuredOutput = config('lattice.typescript.base_output');
        $outputFor = static fn (string $package): string => is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput.($package === 'framework' ? '' : '/'.$package)
            : $packageRoot.'/packages/'.$package.($package === 'framework' ? '/resources/js/types' : '/resources/js');

        $this->writeModule($outputFor('framework'), $emitter->emitModule($document), $formatter);

        $formFields = $this->buildFormFields($discovered);
        $tableType = AsComponent::wireTypeForClass(TableComponent::class);

        $this->writeModule($outputFor('table'), $emitter->emitScopedModule(
            $this->scopedDocument(
                $document,
                classes: [
                    ...array_values(array_filter(
                        $manifest->enums,
                        static fn (string $class): bool => str_starts_with($class, 'Lattice\\Table\\')
                            || in_array($class, [ColorKind::class, Op::class, ColumnWidth::class, DateTimeStyle::class, NumberFormatUnit::class], true),
                    )),
                    ...array_values(array_unique([
                        ...array_filter(
                            $manifest->valueObjects,
                            static fn (string $class): bool => str_starts_with($class, 'Lattice\\Table\\'),
                        ),
                        Color::class,
                        Option::class,
                    ])),
                ],
                verbatimFamilies: ['column', 'filter'],
                componentClassesByType: [$tableType => TableComponent::class],
                domains: [
                    'ColumnNodeType' => $document['x-lattice']['domains']['ColumnNodeType'] ?? [],
                    'FilterNodeType' => $document['x-lattice']['domains']['FilterNodeType'] ?? [],
                    'NodeType' => [$tableType],
                    'TableNodeType' => [$tableType],
                ],
            ),
            'import type { Node } from "@lattice-php/core";'.PHP_EOL.'import type { ColumnNode, FilterNode } from "./types";'.PHP_EOL.PHP_EOL,
        ), $formatter);

        $actionNodes = ['Action' => $this->buildBucket($discovered, 'Actions')];

        $this->writeModule($outputFor('action'), $emitter->emitScopedModule(
            $this->scopedDocument(
                $document,
                classes: [
                    ...array_values(array_unique([
                        ...array_filter(
                            $manifest->enums,
                            static fn (string $class): bool => str_starts_with($class, 'Lattice\\Actions\\'),
                        ),
                        Emphasis::class,
                        ModalWidth::class,
                        Orientation::class,
                        Side::class,
                        Variant::class,
                    ])),
                    ...array_values(array_filter(
                        $manifest->valueObjects,
                        static fn (string $class): bool => str_starts_with($class, 'Lattice\\Actions\\'),
                    )),
                ],
                verbatimFamilies: [],
                componentClassesByType: $this->classesByType($actionNodes['Action']),
                domains: [
                    'ActionNodeType' => $this->typesOf($actionNodes['Action']),
                    'NodeType' => $this->typesOf($actionNodes['Action']),
                ],
            ),
            'import type { Node } from "@lattice-php/core";'.PHP_EOL.PHP_EOL,
        ), $formatter);

        $uiEffects = $manifest->family('effect');
        $uiNodes = ['Ui' => $this->buildBucket($discovered, 'Ui')];

        $this->writeModule($outputFor('ui'), $emitter->emitScopedModule(
            $this->scopedDocument(
                $document,
                classes: [
                    ...array_values(array_unique([
                        ...array_filter(
                            $manifest->enums,
                            static fn (string $class): bool => str_starts_with($class, 'Lattice\\Ui\\') || $class === ColorKind::class,
                        ),
                        ...array_filter(
                            $manifest->valueObjects,
                            static fn (string $class): bool => str_starts_with($class, 'Lattice\\Ui\\'),
                        ),
                        ...array_keys($uiEffects),
                        Affix::class,
                        Color::class,
                        Option::class,
                    ])),
                ],
                verbatimFamilies: ['effect'],
                componentClassesByType: $this->classesByType($uiNodes['Ui']),
                domains: [
                    'UiNodeType' => $this->typesOf($uiNodes['Ui']),
                    'NodeType' => $this->typesOf($uiNodes['Ui']),
                ],
            ),
            'import type { Node } from "@lattice-php/core";'.PHP_EOL.PHP_EOL,
        ), $formatter);

        $editorExtensions = $manifest->family('editor-extension');
        $formFieldTypes = array_values($formFields);
        $formType = AsComponent::wireTypeForClass(Form::class);

        $this->writeModule($outputFor('form'), $emitter->emitScopedModule(
            $this->scopedDocument(
                $document,
                classes: [
                    ...array_values(array_unique([
                        ...array_filter(
                            $manifest->enums,
                            static fn (string $class): bool => str_starts_with($class, 'Lattice\\Form\\')
                                || in_array($class, [Op::class, ColumnWidth::class, Emphasis::class, Justify::class, Orientation::class, Variant::class], true),
                        ),
                        ...array_filter(
                            $manifest->valueObjects,
                            static fn (string $class): bool => str_starts_with($class, 'Lattice\\Form\\'),
                        ),
                        ...array_keys($editorExtensions),
                        Affix::class,
                        Option::class,
                    ])),
                ],
                verbatimFamilies: ['editor-extension'],
                componentClassesByType: [...array_flip($formFields), $formType => Form::class],
                domains: [
                    'FormFieldNodeType' => $formFieldTypes,
                    'FormNodeType' => [...$formFieldTypes, $formType],
                    'NodeType' => [...$formFieldTypes, $formType],
                ],
            ),
            'import type { Node } from "@lattice-php/core";'.PHP_EOL.PHP_EOL,
        ), $formatter);

        return 'Regenerated built-in TypeScript types.';
    }

    private function writeModule(string $directory, string $contents, OxfmtFormatter $formatter): void
    {
        File::ensureDirectoryExists($directory);
        $path = $directory.'/generated.ts';
        File::put($path, $contents);
        $formatter->format([$path]);
    }

    /**
     * Restricts a canonical document to the classes and families a single
     * component package's generated.ts needs, keyed and shaped exactly like
     * the canonical document so the emitter needs no package-specific logic.
     *
     * @param  array<string, mixed>  $document
     * @param  list<class-string>  $classes  enums/value-objects to include, by PHP class
     * @param  list<string>  $verbatimFamilies  family categories copied through unchanged (e.g. column, filter)
     * @param  array<string, class-string>  $componentClassesByType  this output's own slice of the component family
     * @param  array<string, list<string>>  $domains  this output's own domain unions
     * @return array<string, mixed>
     */
    private function scopedDocument(
        array $document,
        array $classes,
        array $verbatimFamilies,
        array $componentClassesByType,
        array $domains,
    ): array {
        $defsByClass = [];

        foreach ($document['$defs'] as $name => $def) {
            // Strict node envelopes (kind: 'strict') carry the same `php` annotation
            // as their props def but are never identifier-resolvable, so they must
            // not win the class → def-name lookup below.
            if (($def['x-lattice']['kind'] ?? null) !== 'strict' && isset($def['x-lattice']['php'])) {
                $defsByClass[$def['x-lattice']['php']] = $name;
            }
        }

        $defs = [];

        foreach (array_unique($classes) as $class) {
            $name = $defsByClass[$class] ?? throw new LogicException(sprintf('No schema def for [%s].', $class));
            $defs[$name] = $document['$defs'][$name];
        }

        $families = [];

        foreach ($verbatimFamilies as $category) {
            $catalog = $document['x-lattice']['families'][$category] ?? null;

            if ($catalog === null || $catalog['types'] === []) {
                continue;
            }

            $families[$category] = $catalog;

            foreach ($catalog['types'] as $entry) {
                $refName = substr((string) $entry['props'], strlen('#/$defs/'));
                $defs[$refName] = $document['$defs'][$refName];
            }

            $family = Lattice::wireFamilies()->firstWhere('category', $category);
            $markerName = $family !== null ? class_basename($family->reference) : null;

            if ($markerName !== null && isset($document['$defs'][$markerName])) {
                $defs[$markerName] = $document['$defs'][$markerName];
            }
        }

        if ($componentClassesByType !== []) {
            $entries = [];

            foreach ($componentClassesByType as $type => $class) {
                $name = $defsByClass[$class] ?? throw new LogicException(sprintf('No schema def for [%s].', $class));
                $defs[$name] = $document['$defs'][$name];
                $entries[$type] = ['props' => '#/$defs/'.$name];
            }

            ksort($entries);

            $families['component'] = [
                'propsMap' => $document['x-lattice']['families']['component']['propsMap'],
                'types' => $entries,
            ];
        }

        $defs = $this->withTransitiveRefs($defs, $document['$defs']);

        ksort($defs);

        return [
            '$defs' => $defs,
            'x-lattice' => [
                'domains' => $domains,
                'families' => $families,
            ],
        ];
    }

    /**
     * Pulls in every def a prop type in `$defs` points at (e.g. an Action's
     * `method: HttpMethod` needs the HttpMethod enum too), so a scoped module
     * carries its own transitive closure instead of a hand-maintained allow-list
     * per package. Node-family refs (`node:*`, `column:*`, …) and the five
     * prelude-owned envelopes resolve to identifiers the custom import header
     * already provides, so they never pull anything in.
     *
     * @param  array<string, mixed>  $defs
     * @param  array<string, mixed>  $allDefs
     * @return array<string, mixed>
     */
    private function withTransitiveRefs(array $defs, array $allDefs): array
    {
        $queue = array_keys($defs);

        while ($queue !== []) {
            $name = array_pop($queue);

            foreach ($this->refsIn($allDefs[$name] ?? []) as $ref) {
                $refName = substr($ref, strlen('#/$defs/'));

                if (str_contains($refName, ':') || in_array($refName, SchemaTypeScriptEmitter::PRELUDE_DEFS, true) || isset($defs[$refName])) {
                    continue;
                }

                if (! isset($allDefs[$refName])) {
                    continue;
                }

                $defs[$refName] = $allDefs[$refName];
                $queue[] = $refName;
            }
        }

        return $defs;
    }

    /**
     * @return list<string>
     */
    private function refsIn(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $refs = [];

        foreach ($value as $key => $child) {
            if ($key === '$ref' && is_string($child)) {
                $refs[] = $child;

                continue;
            }

            $refs = [...$refs, ...$this->refsIn($child)];
        }

        return $refs;
    }

    /**
     * @param  array<class-string, array{type: string, container?: bool, interactive?: bool}>  $bucket
     * @return array<string, class-string>
     */
    private function classesByType(array $bucket): array
    {
        $map = [];

        foreach ($bucket as $class => $spec) {
            $map[$spec['type']] = $class;
        }

        return $map;
    }

    /**
     * @param  array<class-string, array{type: string, container?: bool, interactive?: bool}>  $bucket
     * @return list<string>
     */
    private function typesOf(array $bucket): array
    {
        $types = array_values(array_map(static fn (array $spec): string => $spec['type'], $bucket));
        sort($types);

        return $types;
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
}
