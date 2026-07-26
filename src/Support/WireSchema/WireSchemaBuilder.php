<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\WireSchema;

use Illuminate\Support\Str;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\WireEnvelope;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Remote\RemoteSchemaResolver;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Support\TypeScript\WireFamily;
use Lattice\Lattice\Support\TypeScript\WireTypeDiscovery;
use Lattice\Lattice\Support\TypeScript\WireTypeManifest;
use LogicException;
use ReflectionClass;
use ReflectionEnum;
use ReflectionProperty;
use Spatie\Attributes\Attributes;

/**
 * Builds the canonical wire-protocol JSON Schema document: every discovered
 * enum, value object, and wire family projected into `$defs`, with the
 * envelopes, strict unions, catalogs, remote-manifest contract, and the
 * `x-lattice` vocabulary the TypeScript emitter consumes. The document is the
 * published contract; everything else is derived from it.
 */
final class WireSchemaBuilder
{
    private const string ID = 'https://lattice-php.dev/schema/v1.json';

    private const int PROTOCOL_VERSION = 1;

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

    /**
     * @param  list<string>  $paths
     * @param  list<string>  $appPaths  App discovery roots whose defs are marked `origin: "app"`.
     * @return array<string, mixed>
     */
    public function build(array $paths, array $appPaths = []): array
    {
        $appManifest = $this->discover($appPaths);
        $this->appClasses = $this->classSet($appManifest);

        $manifest = $this->merge($this->discover($paths), $appManifest);
        $names = $this->defNames($manifest);
        $markers = $this->markers();
        $nodeDefs = $this->nodeDefs($manifest);

        $mapper = new PropertySchemaMapper(new WireSchemaContext($names, $nodeDefs, $markers));

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
            $defs[$this->nodeDefKey($component->category, $component->type)] = $this->nodeDef($component, $names);
        }

        foreach (WireFamily::markerFamilies() as $family) {
            if ($this->wireProperties($family->marker) === []) {
                continue;
            }

            $defs[class_basename($family->marker)] = $this->objectDef($family->marker, $mapper, [
                'kind' => 'common-props',
                'family' => $family->category,
                'php' => $family->marker,
            ]);
        }

        foreach (WireFamily::registryFamilies() as $family) {
            foreach ($manifest->family($family->category) as $class => $type) {
                $defs[$names[$class]] = $this->objectDef($class, $mapper, $this->annotated([
                    'kind' => 'props',
                    'family' => $family->category,
                    'wireType' => $type,
                    'php' => $class,
                ], $class));
                $defs[$this->nodeDefKey($family->category, $type)] = $this->payloadDef($family->category, $type, $names[$class], $class);
            }
        }

        foreach ($this->envelopeDefs() as $name => $def) {
            $defs[$name] = $def;
        }

        foreach ($this->strictUnionDefs($manifest) as $name => $def) {
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
                'families' => $this->familiesCatalog($manifest, $names),
                'domains' => $this->domainsCatalog($manifest),
            ],
            '$defs' => $defs,
        ];
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
            $manifest = new WireTypeDiscovery()->discover($path);

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

        foreach (WireFamily::markerFamilies() as $family) {
            if ($this->wireProperties($family->marker) !== []) {
                $names[$family->marker] = class_basename($family->marker);
            }
        }

        foreach (WireFamily::registryFamilies() as $family) {
            $names[$family->reference()] = $family->looseAlias();

            foreach (array_keys($manifest->family($family->category)) as $class) {
                $attribute = Attributes::get($class, $family->attribute()) ?? throw new LogicException(
                    sprintf('Class [%s] is missing its family attribute.', $class),
                );

                $names[$class] = $attribute->typeNamePrefix().class_basename($class);
            }
        }

        $this->guardUniqueNames($names);

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

        foreach (WireFamily::markerFamilies() as $family) {
            $markers[$family->marker] = [$family->category, WireEnvelope::forClass($family->marker)];
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
    private function objectDef(string $class, PropertySchemaMapper $mapper, array $annotation): array
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
    private function componentPropsDef(DiscoveredComponent $component, PropertySchemaMapper $mapper): array
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
    private function nodeDef(DiscoveredComponent $component, array $names): array
    {
        $propsRef = ['$ref' => '#/$defs/'.$names[$component->class]];

        $properties = ['type' => ['const' => $component->type]];

        if ($component->category === 'component') {
            $properties['id'] = ['type' => 'string'];
        }

        $properties['key'] = ['type' => 'string'];
        $properties['props'] = [
            'allOf' => [$propsRef, ['$ref' => '#/$defs/CommonNodeProps']],
        ];
        $properties['schema'] = ['$ref' => '#/$defs/Schema'];

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
    private function payloadDef(string $category, string $type, string $propsName, string $class): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'type' => ['const' => $type],
                'props' => ['$ref' => '#/$defs/'.$propsName],
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
     * @return array<string, array<string, mixed>>
     */
    private function strictUnionDefs(WireTypeManifest $manifest): array
    {
        $types = [];

        foreach ($manifest->components as $component) {
            $types[$component->category][] = $component->type;
        }

        foreach (WireFamily::registryFamilies() as $family) {
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
                    fn (string $type): array => ['$ref' => '#/$defs/'.$this->nodeDefKey($category, $type)],
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
    private function familiesCatalog(WireTypeManifest $manifest, array $names): array
    {
        $catalog = [];

        foreach (WireFamily::all() as $family) {
            $envelope = $family->marker !== null
                ? WireEnvelope::forClass($family->marker)
                : $family->looseAlias();

            $entries = [];

            if ($family->marker !== null) {
                foreach ($manifest->components as $component) {
                    if ($component->category !== $family->category) {
                        continue;
                    }

                    $entry = [
                        'node' => '#/$defs/'.$this->nodeDefKey($family->category, $component->type),
                        'props' => '#/$defs/'.$names[$component->class],
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
                        'node' => '#/$defs/'.$this->nodeDefKey($family->category, $type),
                        'props' => '#/$defs/'.$names[$class],
                    ];
                }
            }

            ksort($entries);

            $catalog[$family->category] = [
                'envelope' => $envelope,
                'strict' => '#/$defs/'.self::STRICT_UNIONS[$family->category],
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

            if ($component->domain === 'Forms') {
                if ($component->class !== Form::class) {
                    $fieldTypes[] = $component->type;
                }
            } elseif ($component->domain !== '') {
                $byDomain[$component->domain][] = $component->type;
            }
        }

        $domains = [];

        sort($fieldTypes);
        $domains['FormFieldNodeType'] = $fieldTypes;

        $formTypes = [...$fieldTypes, AsComponent::wireTypeForClass(Form::class)];
        sort($formTypes);
        $domains['FormNodeType'] = $formTypes;

        ksort($byDomain);

        foreach ($byDomain as $domain => $types) {
            sort($types);
            $domains[Str::singular($domain).'NodeType'] = $types;
        }

        sort($componentTypes);
        $domains['NodeType'] = $componentTypes;

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
