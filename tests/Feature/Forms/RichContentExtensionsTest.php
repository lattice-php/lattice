<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\RichContent;
use Lattice\Lattice\Tests\Fixtures\RichEditor\CalloutExtension;

function calloutDoc(): array
{
    return [
        'type' => 'doc',
        'content' => [
            ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'before']]],
            ['type' => 'callout', 'attrs' => ['id' => 7, 'tone' => 'info']],
        ],
    ];
}

it('keeps extension nodes in the schema when the extension is active', function (): void {
    $array = RichContent::make(calloutDoc(), extensions: [CalloutExtension::make()])->toArray();

    expect($array['content'][1]['type'])->toBe('callout');
});

it('strips extension nodes from the schema without the extension', function (): void {
    $array = RichContent::make(calloutDoc())->toArray();

    $types = array_map(static fn (array $node): string => $node['type'], $array['content']);
    expect($types)->not->toContain('callout');
});

it('keeps extension nodes through the rich editor submit cast', function (): void {
    $field = RichEditor::make('body')->withExtensions(CalloutExtension::make());

    $cast = $field->castValue(json_encode(calloutDoc()));

    expect($cast['content'][1]['type'] ?? null)->toBe('callout');
});

it('strips extension nodes on submit when the field does not activate the extension', function (): void {
    $field = RichEditor::make('body');

    $cast = $field->castValue(json_encode(calloutDoc()));

    $types = array_map(static fn (array $node): string => $node['type'], $cast['content']);
    expect($types)->not->toContain('callout');
});
