<?php
declare(strict_types=1);

use Lattice\Support\TypeScript\SchemaTypeScriptEmitter;

/**
 * @param  array<string, mixed>  $defs
 * @param  array<string, mixed>  $domains
 * @param  array<string, mixed>  $families
 * @return array<string, string>
 */
function emitted(array $defs, array $domains = [], array $families = []): array
{
    return new SchemaTypeScriptEmitter()->exports([
        '$defs' => $defs,
        'x-lattice' => ['domains' => $domains, 'families' => $families],
    ]);
}

it('renders enums, objects, records, and quoted keys', function (): void {
    $exports = emitted([
        'Size' => ['type' => 'string', 'enum' => ['sm', 'lg'], 'x-lattice' => ['kind' => 'enum']],
        'Widget' => [
            'type' => 'object',
            'properties' => [
                'colors' => ['type' => 'object', 'additionalProperties' => ['type' => 'string'], 'x-lattice' => ['keys' => 'integer|string']],
                'label' => ['type' => ['string', 'null'], 'readOnly' => true],
                'meta.info' => ['type' => 'object'],
                'node' => ['anyOf' => [['$ref' => '#/$defs/node:badge'], ['type' => 'null']]],
            ],
            'required' => ['colors', 'label', 'meta.info', 'node'],
        ],
        'Empty' => ['type' => 'object', 'properties' => [], 'additionalProperties' => false],
    ]);

    expect($exports['Size'])->toBe('"sm" | "lg"')
        ->and($exports['Empty'])->toBe('Record<string, never>')
        ->and($exports['Widget'])->toBe(<<<'TS'
{
  colors: Record<string | number, string>;
  readonly label: string | null;
  "meta.info": Record<string, unknown>;
  node: Node<"badge"> | null;
}
TS);
});

it('wraps unions beyond the print width and skips strict, union, remote, and prelude defs', function (): void {
    $long = array_map(fn (int $i): string => sprintf('a-very-long-node-type-%02d', $i), range(1, 5));

    $emitter = new SchemaTypeScriptEmitter;
    $module = $emitter->emitModule([
        '$defs' => [
            'Node' => ['type' => 'object'],
            'ComponentNode' => ['oneOf' => [], 'x-lattice' => ['kind' => 'union']],
            'RemoteManifest' => ['anyOf' => [], 'x-lattice' => ['kind' => 'remote']],
            'node:badge' => ['type' => 'object', 'x-lattice' => ['kind' => 'strict']],
        ],
        'x-lattice' => ['domains' => ['LongNodeType' => $long, 'ShortNodeType' => ['a', 'b']], 'families' => []],
    ]);

    expect($module)->toContain('export type ShortNodeType = "a" | "b";')
        ->toContain("export type LongNodeType =\n  | \"a-very-long-node-type-01\"")
        ->not->toContain('export type Node =')
        ->not->toContain('export type ComponentNode')
        ->not->toContain('export type RemoteManifest')
        ->not->toContain('node:badge');
});

it('hugs a bare object union member but wraps an array-of-object union', function (): void {
    $shape = ['type' => 'object', 'properties' => ['id' => ['type' => 'string']], 'required' => ['id']];

    $exports = emitted([
        'Widget' => [
            'type' => 'object',
            'properties' => [
                'hugged' => ['anyOf' => [$shape, ['type' => 'null']]],
                'wrapped' => ['anyOf' => [['type' => 'array', 'items' => $shape], ['type' => 'null']]],
            ],
            'required' => ['hugged', 'wrapped'],
        ],
    ]);

    expect($exports['Widget'])->toBe(<<<'TS'
{
  hugged: {
    id: string;
  } | null;
  wrapped:
    | {
        id: string;
      }[]
    | null;
}
TS);
});
