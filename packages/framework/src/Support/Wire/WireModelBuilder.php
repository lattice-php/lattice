<?php
declare(strict_types=1);

namespace Lattice\Support\Wire;

use Illuminate\Support\Str;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Attributes\WireEnvelope;
use Lattice\Core\Facades\Lattice;
use Lattice\Form\Components\Form;
use Lattice\Remote\RemoteSchemaResolver;
use Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Support\TypeScript\WireTypeDiscovery;
use Lattice\Support\TypeScript\WireTypeManifest;
use LogicException;
use ReflectionClass;
use ReflectionEnum;
use ReflectionProperty;
use Spatie\Attributes\Attributes;

/**
 * Builds the in-memory wire model: every discovered enum, value object, and
 * wire family projected into `$defs`, with the envelopes, strict unions,
 * catalogs, remote-manifest contract, and the `x-lattice` vocabulary the
 * TypeScript emitter consumes.
 *
 * `build()` is the single-document path (`$id` fixed, every class inlined
 * into one `$defs` namespace) TypeScript emission uses. `buildAll()` is the
 * per-package-document path: one document per `WireSourceCatalog` source,
 * `$defs` restricted to that source's own classes; a foreign reference stays
 * a local `#/$defs/{name}` pointer the document itself cannot resolve. The
 * envelopes/strict unions/remote-manifest contract/`x-lattice` catalogs stay
 * in the framework (`lattice`) document only.
 */
final class WireModelBuilder
{
    private const string ID = 'https://lattice-php.dev/schema/v1.json';

    private const int PROTOCOL_VERSION = 1;

    private const string FRAMEWORK_SOURCE = 'lattice';

    private const array NODE_DEF_PREFIXES = [
        'component' => 'node',
        'column' => 'column',
        'filter' => 'filter',
        'effect' => 'effect',
        'editor-extension' => 'editor-extension',
    ];

    private const array STRICT_UNIONS = [
        'component' => 'ComponentNode',
        'column' => 'ColumnNodeStrict',
        'filter' => 'FilterNodeStrict',
        'effect' => 'EffectStrict',
        'editor-extension' => 'EditorExtensionStrict',
    ];

    /**
     * @var array<class-string, true>
     */
    private array $appClasses = [];

    public function __construct(private readonly ?WireSourceCatalog $catalog = null) {}

    /**
     * @param  list<string>  $paths
     * @param  list<string>  $appPaths  App discovery roots whose defs are marked `origin: "app"`.
     * @return array<string, mixed>
     */
    public function build(array $paths, array $appPaths = []): array
    {
        $this->appClasses = [];

        $appManifest = $this->discover($appPaths);
        $this->appClasses = $this->classSet($appManifest);

        $manifest = $this->merge($this->discover($paths), $appManifest);
        $names = $this->defNames($manifest);
        $this->guardUniqueNames($names);
        $markers = $this->markers();
        $nodeDefs = $this->nodeDefs($manifest);

        $context = new WireModelContext($names, $nodeDefs, $markers);
        $mapper = new PropertyTypeMapper($context);

        $defs = [];

        foreach ($manifest->enums as $enum) {
            $defs[$names[$enum]] = $this->enumDef($enum);
        }

        foreach ($manifest->valueObjects as $class) {
            $defs[$names[$class]] = $this->objectDef($class, $mapper, $this->annotated([
                'kind' => 'value-object',
                'php' => $class,
            ], $class));
        }

        foreach ($manifest->components as $component) {
            $defs[$names[$component->class]] = $this->componentPropsDef($component, $mapper);
            $defs[$this->nodeDefKey($component->category, $component->type)] = $this->nodeDef($component, $names, $context);
        }

        foreach (Lattice::wireFamilies()->where('marker', true) as $family) {
            if ($this->wireProperties($family->reference) === []) {
                continue;
            }

            $defs[class_basename($family->reference)] = $this->objectDef($family->reference, $mapper, [
                'kind' => 'common-props',
                'family' => $family->category,
                'php' => $family->reference,
            ]);
        }

        foreach (Lattice::wireFamilies()->where('marker', false) as $family) {
            foreach ($manifest->family($family->category) as $class => $type) {
                $defs[$names[$class]] = $this->objectDef($class, $mapper, $this->annotated([
                    'kind' => 'props',
                    'family' => $family->category,
                    'wireType' => $type,
                    'php' => $class,
                ], $class));
                $defs[$this->nodeDefKey($family->category, $type)] = $this->payloadDef($family->category, $type, $names[$class], $class, $context);
            }
        }

        foreach ($this->envelopeDefs() as $name => $def) {
            $defs[$name] = $def;
        }

        foreach ($this->strictUnionDefs($manifest, $context) as $name => $def) {
            $defs[$name] = $def;
        }

        $defs['RemoteManifest'] = $this->remoteManifestDef();
        $defs['RemoteManifestNode'] = $this->remoteManifestNodeDef();

        ksort($defs);

        return [
            '$schema' => 'https://json-schema.org/draft/2020-12/schema',
            '$id' => self::ID,
            'title' => 'Lattice wire protocol',
            'x-lattice' => [
                'protocolVersion' => self::PROTOCOL_VERSION,
                'families' => $this->familiesCatalog($manifest, $names, $context),
                'domains' => $this->domainsCatalog($manifest),
            ],
            '$defs' => $defs,
        ];
    }

    /**
     * One document per `WireSourceCatalog` source: `$defs` restricted to
     * classes whose file's origin is that source — every other package's own
     * def is left for the TypeScript emitter to resolve as a cross-package
     * import via the returned `defOrigins` map, instead of being duplicated
     * into every document that references it. A non-framework document's
     * `x-lattice` catalog is scoped to its own origin too (its own
     * `…PropsMap`/`…NodeType` only); the framework document additionally
     * carries the system-wide `NodeType`/per-domain unions every plugin's
     * compile-time totality check needs, since only the full manifest knows
     * about every origin's node types.
     *
     * @return array{documents: array<string, array<string, mixed>>, defOrigins: array<string, string>}
     */
    public function buildAll(): array
    {
        $this->appClasses = [];

        $catalog = $this->catalog ?? WireSourceCatalog::fromApplication();
        $sources = $catalog->discover();

        $allDirs = [];

        foreach ($sources as $source) {
            $allDirs = [...$allDirs, ...$source->dirs];
        }

        $manifest = $this->discover($allDirs);
        $names = $this->defNames($manifest);
        $this->guardUniqueNames($names);
        $markers = $this->markers();
        $nodeDefs = $this->nodeDefs($manifest);
        $classOrigins = $this->classOrigins($manifest, $catalog);

        $documents = [];

        foreach ($sources as $source) {
            $documents[$source->shortName] = $this->document($source, $manifest, $names, $markers, $nodeDefs, $classOrigins);
        }

        $defOrigins = [];

        foreach ($names as $class => $name) {
            if (isset($classOrigins[$class])) {
                $defOrigins[$name] = $classOrigins[$class];
            }
        }

        return ['documents' => $documents, 'defOrigins' => $defOrigins];
    }

    /**
     * @param  array<class-string, string>  $names
     * @param  array<string, array<class-string, string>>  $nodeDefs
     * @param  array<class-string, array{string, string}>  $markers
     * @param  array<class-string, string>  $classOrigins
     * @return array<string, mixed>
     */
    private function document(
        WireSource $source,
        WireTypeManifest $manifest,
        array $names,
        array $markers,
        array $nodeDefs,
        array $classOrigins,
    ): array {
        $context = new WireModelContext($names, $nodeDefs, $markers);
        $mapper = new PropertyTypeMapper($context);
        $isFramework = $source->shortName === self::FRAMEWORK_SOURCE;
        $originManifest = $this->manifestForOrigin($manifest, $classOrigins, $source->shortName);

        $defs = [];

        foreach ($originManifest->enums as $enum) {
            $defs[$names[$enum]] = $this->enumDef($enum);
        }

        foreach ($originManifest->valueObjects as $class) {
            $defs[$names[$class]] = $this->objectDef($class, $mapper, $this->annotated(['kind' => 'value-object', 'php' => $class], $class));
        }

        foreach ($originManifest->components as $component) {
            $defs[$names[$component->class]] = $this->componentPropsDef($component, $mapper);
            $defs[$this->nodeDefKey($component->category, $component->type)] = $this->nodeDef($component, $names, $context);
        }

        foreach (Lattice::wireFamilies()->where('marker', true) as $family) {
            if ($this->wireProperties($family->reference) === [] || ($classOrigins[$family->reference] ?? null) !== $source->shortName) {
                continue;
            }

            $defs[class_basename($family->reference)] = $this->objectDef($family->reference, $mapper, $this->annotated([
                'kind' => 'common-props',
                'family' => $family->category,
                'php' => $family->reference,
            ], $family->reference));
        }

        foreach (Lattice::wireFamilies()->where('marker', false) as $family) {
            foreach ($originManifest->family($family->category) as $class => $type) {
                $defs[$names[$class]] = $this->objectDef($class, $mapper, $this->annotated([
                    'kind' => 'props',
                    'family' => $family->category,
                    'wireType' => $type,
                    'php' => $class,
                ], $class));
                $defs[$this->nodeDefKey($family->category, $type)] = $this->payloadDef($family->category, $type, $names[$class], $class, $context);
            }

            // The loose envelope generic (`{type, props}`, unioned across every
            // concrete payload) belongs wherever its family reference class
            // lives — unless that family already has a hand-written home
            // elsewhere (component/column/filter's Node/ColumnNode/FilterNode
            // in @lattice-php/core and table's own ./types; effect's in
            // @lattice-php/ui/effects/types), which the TypeScript emitter's
            // marker table resolves to instead of a generated def.
            if (($classOrigins[$family->reference] ?? null) === $source->shortName && $family->category === 'editor-extension') {
                $defs[$family->looseAlias()] = $this->looseEnvelopeDef($family->category);
            }
        }

        ksort($defs);

        $catalogManifest = $isFramework ? $manifest : $originManifest;

        return [
            '$id' => $source->schemaId(),
            '$defs' => $defs,
            'x-lattice' => [
                'domains' => $this->domainsCatalog($catalogManifest),
                'families' => $this->familiesCatalog($originManifest, $names, $context),
            ],
        ];
    }

    /**
     * Restricts a manifest to the classes a single `WireSourceCatalog`
     * source owns, keyed and shaped exactly like the full manifest so
     * `domainsCatalog()`/`familiesCatalog()` need no origin-awareness of
     * their own.
     *
     * @param  array<class-string, string>  $classOrigins
     */
    private function manifestForOrigin(WireTypeManifest $manifest, array $classOrigins, string $shortName): WireTypeManifest
    {
        $matches = static fn (string $class): bool => ($classOrigins[$class] ?? null) === $shortName;

        $families = [];

        foreach ($manifest->families as $category => $classes) {
            $families[$category] = array_filter($classes, static fn (string $class): bool => $matches($class), ARRAY_FILTER_USE_KEY);
        }

        return new WireTypeManifest(
            array_values(array_filter($manifest->enums, $matches)),
            array_values(array_filter($manifest->valueObjects, $matches)),
            array_values(array_filter($manifest->components, static fn (DiscoveredComponent $c): bool => $matches($c->class))),
            $families,
        );
    }

    /**
     * @param  list<string>  $paths
     */
    private function discover(array $paths): WireTypeManifest
    {
        $enums = [];
        $valueObjects = [];
        $components = [];
        $families = [];

        foreach ($paths as $path) {
            $manifest = app(WireTypeDiscovery::class)->discover($path);

            $enums = [...$enums, ...$manifest->enums];
            $valueObjects = [...$valueObjects, ...$manifest->valueObjects];
            $components = [...$components, ...$manifest->components];

            foreach ($manifest->families as $category => $classes) {
                $families[$category] = [...$families[$category] ?? [], ...$classes];
            }
        }

        sort($enums);
        sort($valueObjects);
        ksort($families);

        return new WireTypeManifest($enums, $valueObjects, $components, $families);
    }

    private function merge(WireTypeManifest $base, WireTypeManifest $extra): WireTypeManifest
    {
        $enums = [...$base->enums, ...$extra->enums];
        $valueObjects = [...$base->valueObjects, ...$extra->valueObjects];
        $families = $base->families;

        foreach ($extra->families as $category => $classes) {
            $families[$category] = [...$families[$category] ?? [], ...$classes];
        }

        sort($enums);
        sort($valueObjects);
        ksort($families);

        return new WireTypeManifest(
            array_values(array_unique($enums)),
            array_values(array_unique($valueObjects)),
            [...$base->components, ...$extra->components],
            $families,
        );
    }

    /**
     * @return array<class-string, true>
     */
    private function classSet(WireTypeManifest $manifest): array
    {
        $classes = [];

        foreach ([...$manifest->enums, ...$manifest->valueObjects] as $class) {
            $classes[$class] = true;
        }

        foreach ($manifest->components as $component) {
            $classes[$component->class] = true;
        }

        foreach ($manifest->families as $members) {
            foreach (array_keys($members) as $class) {
                $classes[$class] = true;
            }
        }

        return $classes;
    }

    /**
     * Resolves every discovered class (including marker reference classes,
     * which `classSet()` does not cover) to the `WireSourceCatalog` source
     * whose discover dir contains its file.
     *
     * @return array<class-string, string>
     */
    private function classOrigins(WireTypeManifest $manifest, WireSourceCatalog $catalog): array
    {
        $classes = $this->classSet($manifest);

        // Every family's reference class gets a `defNames()` entry (marker
        // families for their own common-props def, loose families for their
        // envelope-name bookkeeping) even when it never becomes a `$defs`
        // entry itself, so `guardUniqueNamesPerOrigin()` needs an origin for
        // it too.
        foreach (Lattice::wireFamilies() as $family) {
            $classes[$family->reference] = true;
        }

        $origins = [];

        foreach (array_keys($classes) as $class) {
            $file = new ReflectionClass($class)->getFileName();
            $source = is_string($file) ? $catalog->originOf($file) : null;

            if (! $source instanceof WireSource) {
                throw new LogicException(sprintf(
                    'No wire source declares [%s] (%s) — is its package\'s composer.json missing extra.lattice.discover?',
                    $class,
                    $file !== false ? $file : 'unknown file',
                ));
            }

            $origins[$class] = $source->shortName;
        }

        return $origins;
    }

    /**
     * @param  array<string, string>  $annotation
     * @param  class-string  $class
     * @return array<string, string>
     */
    private function annotated(array $annotation, string $class): array
    {
        if (isset($this->appClasses[$class])) {
            $annotation['origin'] = 'app';
        }

        return $annotation;
    }

    /**
     * @return array<class-string, string>
     */
    private function defNames(WireTypeManifest $manifest): array
    {
        $names = [];

        foreach ([...$manifest->enums, ...$manifest->valueObjects] as $class) {
            $names[$class] = class_basename($class);
        }

        foreach ($manifest->components as $component) {
            $names[$component->class] = class_basename($component->class);
        }

        foreach (Lattice::wireFamilies()->where('marker', true) as $family) {
            if ($this->wireProperties($family->reference) !== []) {
                $names[$family->reference] = class_basename($family->reference);
            }
        }

        foreach (Lattice::wireFamilies()->where('marker', false) as $family) {
            $names[$family->reference] = $family->looseAlias();

            foreach (array_keys($manifest->family($family->category)) as $class) {
                $attribute = Attributes::get($class, $family->attribute) ?? throw new LogicException(
                    sprintf('Class [%s] is missing its family attribute.', $class),
                );

                $names[$class] = $attribute->typeNamePrefix().class_basename($class);
            }
        }

        return $names;
    }

    /**
     * @param  array<class-string, string>  $names
     */
    private function guardUniqueNames(array $names): void
    {
        $seen = [];

        foreach ($names as $class => $name) {
            if (isset($seen[$name])) {
                throw new LogicException(sprintf(
                    'Schema definition name [%s] is claimed by both [%s] and [%s]. Give the family attribute a typeNamePrefix().',
                    $name,
                    $seen[$name],
                    $class,
                ));
            }

            $seen[$name] = $class;
        }
    }

    /**
     * @return array<class-string, array{string, string}>
     */
    private function markers(): array
    {
        $markers = [];

        foreach (Lattice::wireFamilies()->where('marker', true) as $family) {
            $markers[$family->reference] = [$family->category, WireEnvelope::forClass($family->reference)];
        }

        return $markers;
    }

    /**
     * @return array<string, array<class-string, string>>
     */
    private function nodeDefs(WireTypeManifest $manifest): array
    {
        $nodeDefs = [];

        foreach ($manifest->components as $component) {
            $nodeDefs[$component->category][$component->class] = $component->type;
        }

        return $nodeDefs;
    }

    /**
     * @param  class-string  $enum
     * @return array<string, mixed>
     */
    private function enumDef(string $enum): array
    {
        $reflection = new ReflectionEnum($enum);
        $backing = (string) $reflection->getBackingType();

        return [
            'type' => $backing === 'int' ? 'integer' : 'string',
            'enum' => array_column($enum::cases(), 'value'),
            'x-lattice' => $this->annotated(['kind' => 'enum', 'php' => $enum], $enum),
        ];
    }

    /**
     * @param  class-string  $class
     * @param  array<string, string>  $annotation
     * @return array<string, mixed>
     */
    private function objectDef(string $class, PropertyTypeMapper $mapper, array $annotation): array
    {
        $properties = [];
        $required = [];

        foreach ($this->wireProperties($class) as $property) {
            $fragment = $mapper->map($property);

            if ($property->isReadOnly()) {
                $fragment['readOnly'] = true;
            }

            $properties[$property->getName()] = $fragment;
            $required[] = $property->getName();
        }

        $def = ['type' => 'object', 'properties' => $properties];

        if ($required !== []) {
            $def['required'] = $required;
        } else {
            $def['additionalProperties'] = false;
        }

        $def['x-lattice'] = $annotation;

        return $def;
    }

    /**
     * @return array<string, mixed>
     */
    private function componentPropsDef(DiscoveredComponent $component, PropertyTypeMapper $mapper): array
    {
        $annotation = [
            'kind' => 'props',
            'family' => $component->category,
            'wireType' => $component->type,
        ];

        if ($component->category === 'component' && $component->domain !== '') {
            $annotation['domain'] = $component->domain;
        }

        $annotation['php'] = $component->class;

        return $this->objectDef($component->class, $mapper, $this->annotated($annotation, $component->class));
    }

    /**
     * @param  array<class-string, string>  $names
     * @return array<string, mixed>
     */
    private function nodeDef(DiscoveredComponent $component, array $names, WireModelContext $context): array
    {
        $propsRef = ['$ref' => $context->refFor($names[$component->class])];

        $properties = ['type' => ['const' => $component->type]];

        if ($component->category === 'component') {
            $properties['id'] = ['type' => 'string'];
        }

        $properties['key'] = ['type' => 'string'];
        $properties['props'] = [
            'allOf' => [$propsRef, ['$ref' => $context->refFor('CommonNodeProps')]],
        ];
        $properties['schema'] = ['$ref' => $context->refFor('Schema')];

        return [
            'type' => 'object',
            'properties' => $properties,
            'required' => $component->category === 'component' ? ['type', 'props'] : ['type', 'key', 'props'],
            'x-lattice' => $this->annotated([
                'kind' => 'strict',
                'family' => $component->category,
                'wireType' => $component->type,
                'php' => $component->class,
            ], $component->class),
        ];
    }

    /**
     * The per-type strict envelope of a non-node family: `{type, props}`
     * without id/key/schema.
     *
     * @return array<string, mixed>
     */
    private function payloadDef(string $category, string $type, string $propsName, string $class, WireModelContext $context): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'type' => ['const' => $type],
                'props' => ['$ref' => $context->refFor($propsName)],
            ],
            'required' => ['type', 'props'],
            'x-lattice' => $this->annotated(['kind' => 'strict', 'family' => $category, 'wireType' => $type], $class),
        ];
    }

    /**
     * The loose envelopes mirroring the hand-written client type calculus in
     * stubs/envelopes.ts — authored here, skipped by the TypeScript emitter.
     *
     * @return array<string, array<string, mixed>>
     */
    private function envelopeDefs(): array
    {
        $nodeEnvelope = static fn (array $required): array => [
            'type' => 'object',
            'properties' => [
                'type' => ['type' => 'string'],
                'key' => ['type' => 'string'],
                'props' => ['type' => 'object'],
                'schema' => ['$ref' => '#/$defs/Schema'],
            ],
            'required' => $required,
        ];
        $payloadEnvelope = static fn (string $category): array => [
            'type' => 'object',
            'properties' => [
                'type' => ['type' => 'string'],
                'props' => ['type' => 'object'],
            ],
            'required' => ['type', 'props'],
            'x-lattice' => ['kind' => 'envelope', 'family' => $category],
        ];
        $node = $nodeEnvelope(['type']);
        $node['properties'] = ['type' => $node['properties']['type'], 'id' => ['type' => 'string']] + $node['properties'];
        $node['x-lattice'] = ['kind' => 'envelope', 'family' => 'component'];
        $column = $nodeEnvelope(['type', 'key', 'props']);
        $column['x-lattice'] = ['kind' => 'envelope', 'family' => 'column'];
        $filter = $nodeEnvelope(['type', 'key', 'props']);
        $filter['x-lattice'] = ['kind' => 'envelope', 'family' => 'filter'];

        return [
            'Node' => $node,
            'ColumnNode' => $column,
            'FilterNode' => $filter,
            'Effect' => $payloadEnvelope('effect'),
            'EditorExtension' => $payloadEnvelope('editor-extension'),
            'Schema' => ['type' => 'array', 'items' => ['$ref' => '#/$defs/Node']],
            'CommonNodeProps' => [
                'type' => 'object',
                'properties' => [
                    'dataBindings' => [
                        'anyOf' => [
                            ['type' => 'object', 'additionalProperties' => ['type' => 'string']],
                            ['type' => 'null'],
                        ],
                    ],
                    'hideWhenCollapsed' => ['type' => ['boolean', 'null']],
                ],
                'x-lattice' => ['kind' => 'envelope', 'family' => 'component'],
            ],
        ];
    }

    /**
     * A loose family's generic envelope (`{type, props}`), for `document()`'s
     * per-origin path — `envelopeDefs()`'s stand-alone counterpart, used only
     * where the family has no hand-written home for the TypeScript emitter's
     * marker table to redirect to instead.
     *
     * @return array<string, mixed>
     */
    private function looseEnvelopeDef(string $category): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'type' => ['type' => 'string'],
                'props' => ['type' => 'object'],
            ],
            'required' => ['type', 'props'],
            'x-lattice' => ['kind' => 'envelope', 'family' => $category],
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function strictUnionDefs(WireTypeManifest $manifest, WireModelContext $context): array
    {
        $types = [];

        foreach ($manifest->components as $component) {
            $types[$component->category][] = $component->type;
        }

        foreach (Lattice::wireFamilies()->where('marker', false) as $family) {
            $types[$family->category] = array_values($manifest->family($family->category));
        }

        $unions = [];

        foreach (self::STRICT_UNIONS as $category => $name) {
            $members = $types[$category] ?? [];

            if ($members === []) {
                continue;
            }

            sort($members);

            $unions[$name] = [
                'oneOf' => array_map(
                    fn (string $type): array => ['$ref' => $context->refFor($this->nodeDefKey($category, $type))],
                    $members,
                ),
                'x-lattice' => ['kind' => 'union', 'family' => $category],
            ];
        }

        return $unions;
    }

    /**
     * @param  array<class-string, string>  $names
     * @return array<string, mixed>
     */
    private function familiesCatalog(WireTypeManifest $manifest, array $names, WireModelContext $context): array
    {
        $catalog = [];

        foreach (Lattice::wireFamilies() as $family) {
            $envelope = $family->marker
                ? WireEnvelope::forClass($family->reference)
                : $family->looseAlias();

            $entries = [];

            if ($family->marker) {
                foreach ($manifest->components as $component) {
                    if ($component->category !== $family->category) {
                        continue;
                    }

                    $entry = [
                        'node' => $context->refFor($this->nodeDefKey($family->category, $component->type)),
                        'props' => $context->refFor($names[$component->class]),
                    ];

                    if ($component->category === 'component' && $component->domain !== '') {
                        $entry['domain'] = $component->domain;
                    }

                    if ($component->container) {
                        $entry['container'] = true;
                    }

                    if ($component->interactive) {
                        $entry['interactive'] = true;
                    }

                    $entries[$component->type] = $entry;
                }
            } else {
                foreach ($manifest->family($family->category) as $class => $type) {
                    $entries[$type] = [
                        'node' => $context->refFor($this->nodeDefKey($family->category, $type)),
                        'props' => $context->refFor($names[$class]),
                    ];
                }
            }

            ksort($entries);

            $catalog[$family->category] = [
                'envelope' => $envelope,
                'strict' => $context->refFor(self::STRICT_UNIONS[$family->category]),
                'propsInterface' => $family->propsInterface(),
                'propsMap' => $family->propsMap(),
                'types' => $entries,
            ];
        }

        return $catalog;
    }

    /**
     * @return array<string, list<string>>
     */
    private function domainsCatalog(WireTypeManifest $manifest): array
    {
        $fieldTypes = [];
        $componentTypes = [];
        $byDomain = [];
        $columnTypes = [];
        $filterTypes = [];

        foreach ($manifest->components as $component) {
            if ($component->category === 'column') {
                $columnTypes[] = $component->type;

                continue;
            }

            if ($component->category === 'filter') {
                $filterTypes[] = $component->type;

                continue;
            }

            $componentTypes[] = $component->type;

            // Singularized, not an exact match: a field a non-Form package
            // contributes to the Form domain from its own `…\Forms\Components\`
            // namespace (e.g. Media's MediaPicker) must join FormNodeType
            // instead of colliding with it — Str::singular('Forms') is 'Form'.
            if (Str::singular($component->domain) === 'Form') {
                if ($component->class !== Form::class) {
                    $fieldTypes[] = $component->type;
                }
            } elseif ($component->domain !== '') {
                $byDomain[$component->domain][] = $component->type;
            }
        }

        $domains = [];

        // A per-origin manifest (`document()`'s non-framework path) may carry
        // no Form component at all — only add the Form domain unions when
        // this manifest actually discovered one, so an unrelated origin
        // doesn't get a spurious `FormNodeType = "form"` of its own.
        $hasForm = array_any($manifest->components, static fn (DiscoveredComponent $c): bool => $c->class === Form::class);

        if ($fieldTypes !== [] || $hasForm) {
            sort($fieldTypes);
            $domains['FormFieldNodeType'] = $fieldTypes;

            $formTypes = $hasForm ? [...$fieldTypes, AsComponent::wireTypeForClass(Form::class)] : $fieldTypes;
            sort($formTypes);
            $domains['FormNodeType'] = $formTypes;
        }

        ksort($byDomain);

        foreach ($byDomain as $domain => $types) {
            sort($types);
            $domains[Str::singular($domain).'NodeType'] = $types;
        }

        if ($componentTypes !== []) {
            sort($componentTypes);
            $domains['NodeType'] = $componentTypes;
        }

        if ($columnTypes !== []) {
            sort($columnTypes);
            $domains['ColumnNodeType'] = $columnTypes;
        }

        if ($filterTypes !== []) {
            sort($filterTypes);
            $domains['FilterNodeType'] = $filterTypes;
        }

        return $domains;
    }

    /**
     * @return array<string, mixed>
     */
    private function remoteManifestDef(): array
    {
        $nodeList = ['type' => 'array', 'items' => ['$ref' => '#/$defs/RemoteManifestNode']];

        return [
            'anyOf' => [
                $nodeList,
                [
                    'type' => 'object',
                    'properties' => [
                        'version' => ['type' => 'integer'],
                        'schema' => $nodeList,
                    ],
                    'required' => ['schema'],
                ],
            ],
            'x-lattice' => ['kind' => 'remote'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function remoteManifestNodeDef(): array
    {
        $remoteCapable = array_keys(RemoteSchemaResolver::EXTERNAL_URL_PROPS);
        sort($remoteCapable);

        return [
            'type' => 'object',
            'properties' => [
                'type' => ['type' => 'string'],
                'id' => ['type' => 'string'],
                'key' => ['type' => 'string'],
                'props' => [
                    'type' => 'object',
                    'propertyNames' => ['not' => ['enum' => RemoteSchemaResolver::FORBIDDEN_PROP_KEYS]],
                ],
                'schema' => ['type' => 'array', 'items' => ['$ref' => '#/$defs/RemoteManifestNode']],
            ],
            'required' => ['type'],
            'allOf' => [
                [
                    'if' => [
                        'properties' => ['type' => ['enum' => $remoteCapable]],
                        'required' => ['type'],
                    ],
                    'then' => [
                        'anyOf' => [['required' => ['id']], ['required' => ['key']]],
                        'properties' => ['props' => ['required' => ['audience']]],
                    ],
                ],
            ],
            'x-lattice' => ['kind' => 'remote'],
        ];
    }

    private function nodeDefKey(string $category, string $type): string
    {
        return self::NODE_DEF_PREFIXES[$category].':'.$type;
    }

    /**
     * @param  class-string  $class
     * @return list<ReflectionProperty>
     */
    private function wireProperties(string $class): array
    {
        $properties = array_values(array_filter(
            new ReflectionClass($class)->getProperties(ReflectionProperty::IS_PUBLIC),
            static fn (ReflectionProperty $property): bool => ! $property->isStatic(),
        ));

        usort(
            $properties,
            static fn (ReflectionProperty $a, ReflectionProperty $b): int => strcmp($a->getName(), $b->getName()),
        );

        return $properties;
    }
}
