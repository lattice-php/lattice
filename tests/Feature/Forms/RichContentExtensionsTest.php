<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\RichContent;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;
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

it('collects nodes of a type depth-first', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            ['type' => 'callout', 'attrs' => ['id' => 1, 'tone' => null]],
            ['type' => 'blockquote', 'content' => [
                ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'quoted']]],
                ['type' => 'callout', 'attrs' => ['id' => 2, 'tone' => 'warn']],
            ]],
        ],
    ];

    $nodes = RichContent::make($doc, extensions: [CalloutExtension::make()])->nodes('callout');

    expect(array_column(array_column($nodes, 'attrs'), 'id'))->toBe([1, 2]);
});

it('collects no nodes from an empty document', function (): void {
    expect(RichContent::make(null)->nodes('callout'))->toBe([]);
});

it('scrubs ephemeral attrs from the canonical array', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            ['type' => 'callout', 'attrs' => ['id' => 7, 'tone' => 'info', 'resolvedLabel' => 'Seven']],
        ],
    ];

    $array = RichContent::make($doc, extensions: [CalloutExtension::make()])->toArray();

    expect($array['content'][0]['attrs'])->toBe(['id' => 7, 'tone' => 'info']);
});

it('scrubs ephemeral attrs on the rich editor submit cast', function (): void {
    $doc = [
        'type' => 'doc',
        'content' => [
            ['type' => 'callout', 'attrs' => ['id' => 7, 'tone' => null, 'resolvedLabel' => 'Seven']],
        ],
    ];
    $field = RichEditor::make('body')->withExtensions(CalloutExtension::make());

    $cast = $field->castValue(json_encode($doc));

    expect($cast['content'][0]['attrs'] ?? [])->not->toHaveKey('resolvedLabel');
});

it('prepares the document for display rendering', function (): void {
    $doc = ['type' => 'doc', 'content' => [['type' => 'callout', 'attrs' => ['id' => 7, 'tone' => null]]]];

    $prepared = RichContent::make($doc, extensions: [CalloutExtension::make()])->toPreparedArray();

    expect($prepared['content'][0]['attrs']['resolvedLabel'])->toBe('callout-7');
});

it('keeps toArray canonical while toPreparedArray carries ephemeral attrs', function (): void {
    $doc = ['type' => 'doc', 'content' => [['type' => 'callout', 'attrs' => ['id' => 7, 'tone' => null]]]];
    $content = RichContent::make($doc, extensions: [CalloutExtension::make()]);

    expect($content->toArray()['content'][0]['attrs'] ?? [])->not->toHaveKey('resolvedLabel')
        ->and($content->toPreparedArray()['content'][0]['attrs'])->toHaveKey('resolvedLabel');
});

it('prepares the document once per instance across toHtml, toText, and toPreparedArray', function (): void {
    $extension = new class extends EditorExtension
    {
        public int $calls = 0;

        public function prepareDocument(array $document): array
        {
            $this->calls++;

            return $document;
        }
    };

    $doc = ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'hi']]]]];
    $content = RichContent::make($doc, extensions: [$extension]);

    $content->toHtml();
    $content->toText();
    $content->toPreparedArray();

    expect($extension->calls)->toBe(1);
});

it('wires the prepared document as the rich editor value prop', function (): void {
    $doc = ['type' => 'doc', 'content' => [['type' => 'callout', 'attrs' => ['id' => 7, 'tone' => null]]]];
    $field = RichEditor::make('body')->withExtensions(CalloutExtension::make())->value($doc);

    $wire = wire($field);

    expect($wire['props']['value']['content'][0]['attrs']['resolvedLabel'] ?? null)->toBe('callout-7');
});
