<?php
declare(strict_types=1);

use Lattice\Core\JsonSchema\SchemaBundler;
use Lattice\Media\Tables\Filters\MediaTypeFilter;
use Lattice\Table\Filters\SelectFilter;

it('merges every document\'s $defs directly into the base document, keeping the base\'s other top-level keys', function (): void {
    $base = ['$schema' => 'https://json-schema.org/draft/2020-12/schema', '$id' => 'https://lattice-php.dev/schema/lattice/v1.json', 'title' => 'Lattice wire protocol', '$defs' => ['Node' => ['type' => 'object']]];
    $documents = [
        ['$defs' => ['Button' => ['type' => 'object', 'properties' => []]]],
        ['$defs' => ['Table' => ['type' => 'object', 'properties' => []]]],
    ];

    $bundle = new SchemaBundler()->bundle($base, $documents);

    expect($bundle['$id'])->toBe('https://lattice-php.dev/schema/lattice/v1.json')
        ->and($bundle['title'])->toBe('Lattice wire protocol')
        ->and($bundle['$defs'])->toHaveKeys(['Node', 'Button', 'Table']);
});

it('collapses an identical def recurring across documents silently, the envelope core case', function (): void {
    $node = ['type' => 'object', 'properties' => ['schema' => ['$ref' => '#/$defs/Schema']]];
    $base = ['$defs' => []];
    $documents = [
        ['$defs' => ['Node' => $node]],
        ['$defs' => ['Node' => $node]],
    ];

    $bundle = new SchemaBundler()->bundle($base, $documents);

    expect($bundle['$defs']['Node'])->toBe($node);
});

it('keeps whichever document is processed first when two classes declare the same strict wire type', function (): void {
    $tableFilter = ['type' => 'object', 'properties' => ['type' => ['const' => 'filter.select']], 'x-lattice' => ['kind' => 'strict', 'php' => SelectFilter::class]];
    $mediaFilter = ['type' => 'object', 'properties' => ['type' => ['const' => 'filter.select']], 'x-lattice' => ['kind' => 'strict', 'php' => MediaTypeFilter::class]];
    $base = ['$defs' => []];
    $documents = [
        ['$defs' => ['filter:filter.select' => $tableFilter]],
        ['$defs' => ['filter:filter.select' => $mediaFilter]],
    ];

    $bundle = new SchemaBundler()->bundle($base, $documents);

    expect($bundle['$defs']['filter:filter.select'])->toBe($tableFilter);
});

it('throws when two unrelated defs claim the same name outside the known strict-collision case', function (): void {
    $base = ['$defs' => []];
    $documents = [
        ['$defs' => ['Button' => ['type' => 'object', 'x-lattice' => ['kind' => 'value-object', 'php' => 'App\First']]]],
        ['$defs' => ['Button' => ['type' => 'string', 'x-lattice' => ['kind' => 'enum', 'php' => 'App\Second']]]],
    ];

    new SchemaBundler()->bundle($base, $documents);
})->throws(LogicException::class, 'Schema definition name [Button] is claimed by two different defs');
