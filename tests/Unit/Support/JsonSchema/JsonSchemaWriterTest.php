<?php
declare(strict_types=1);

use Lattice\Support\JsonSchema\JsonSchemaWriter;

it('encodes empty schema fragments as JSON objects', function (): void {
    $json = new JsonSchemaWriter()->write([
        '$defs' => [
            'Empty' => ['type' => 'object', 'properties' => []],
            'Mixed' => ['type' => 'object', 'properties' => ['value' => []]],
        ],
    ]);

    expect($json)->toContain('"properties": {}')
        ->toContain('"value": {}')
        ->not->toContain('[]');
});

it('writes pretty two-space-indented JSON with unescaped slashes and a trailing newline', function (): void {
    $json = new JsonSchemaWriter()->write(['$id' => 'https://lattice-php.dev/schema/v1.json', 'a' => ['b' => 1]]);

    expect($json)->toBe(<<<'JSON'
{
  "$id": "https://lattice-php.dev/schema/v1.json",
  "a": {
    "b": 1
  }
}

JSON);
});

it('keeps JSON arrays as arrays', function (): void {
    $json = new JsonSchemaWriter()->write(['required' => ['a', 'b'], 'enum' => ['x']]);

    expect(json_decode($json, true))->toBe(['required' => ['a', 'b'], 'enum' => ['x']]);
});
