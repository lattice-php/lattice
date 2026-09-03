<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\RichEditor;
use Lattice\Form\RichEditor\Extensions\Bold;
use Lattice\Form\RichEditor\Extensions\BulletList;
use Lattice\Form\RichEditor\Extensions\Details;
use Lattice\Form\RichEditor\Extensions\Heading;
use Lattice\Form\RichEditor\Extensions\Italic;
use Lattice\Form\RichEditor\Extensions\Link;
use Lattice\Form\RichEditor\Extensions\Table;

afterEach(function (): void {
    RichEditor::defaultExtensionsUsing(null);
});

/**
 * @return list<array<string, mixed>>
 */
function editorExtensions(RichEditor $field): array
{
    return wire($field)['props']['extensions'];
}

/**
 * @return list<string>
 */
function editorExtensionTypes(RichEditor $field): array
{
    return array_column(editorExtensions($field), 'type');
}

describe('extensions', function (): void {
    it('serializes the default set in toolbar order', function (): void {
        expect(editorExtensionTypes(RichEditor::make('body')))->toBe([
            'bold', 'italic', 'strike', 'underline', 'highlight', 'code',
            'heading',
            'bullet-list', 'ordered-list', 'blockquote', 'code-block', 'horizontal-rule',
            'text-align',
            'link',
            'table', 'details',
            'emoji',
            'slash-menu',
        ]);
    });

    it('replaces the set and keeps the given order', function (): void {
        $field = RichEditor::make('body')->extensions([
            Bold::make(),
            Heading::make()->levels(1, 2),
            'mention',
        ]);

        expect(editorExtensions($field))->toBe([
            ['type' => 'bold', 'props' => []],
            ['type' => 'heading', 'props' => ['levels' => [1, 2]]],
            ['type' => 'mention', 'props' => []],
        ]);
    });

    it('instantiates a registered wire type given as a string with its defaults', function (): void {
        $field = RichEditor::make('body')->extensions(['heading']);

        expect(editorExtensions($field))->toBe([
            ['type' => 'heading', 'props' => ['levels' => [1, 2, 3, 4, 5, 6]]],
        ]);
    });

    it('passes an unknown string through as a bare type', function (): void {
        expect(editorExtensions(RichEditor::make('body')->extensions(['mention'])))
            ->toBe([['type' => 'mention', 'props' => []]]);
    });

    it('dedupes by wire type, keeping the first position and the last configuration', function (): void {
        $field = RichEditor::make('body')->extensions([
            Heading::make()->levels(1),
            Bold::make(),
            Heading::make()->levels(2),
        ]);

        expect(editorExtensions($field))->toBe([
            ['type' => 'heading', 'props' => ['levels' => [2]]],
            ['type' => 'bold', 'props' => []],
        ]);
    });

    it('adds to a replaced set', function (): void {
        $field = RichEditor::make('body')
            ->extensions([Bold::make(), Italic::make()])
            ->withExtensions(Table::make());

        expect(editorExtensionTypes($field))->toBe(['bold', 'italic', 'table']);
    });

    it('adds to the default set when nothing was configured', function (): void {
        $types = editorExtensionTypes(RichEditor::make('body')->withExtensions('mention'));

        expect($types)->toHaveCount(19)
            ->and($types[0])->toBe('bold')
            ->and($types[18])->toBe('mention');
    });

    it('reconfigures a default extension in place', function (): void {
        $field = RichEditor::make('body')->withExtensions(Heading::make()->levels(2, 3));

        $extensions = editorExtensions($field);

        expect(array_column($extensions, 'type'))->toHaveCount(18)
            ->and($extensions[6])->toBe(['type' => 'heading', 'props' => ['levels' => [2, 3]]]);
    });

    it('subtracts by class-string and by wire type', function (): void {
        $types = editorExtensionTypes(
            RichEditor::make('body')->withoutExtensions(Details::class, 'emoji'),
        );

        expect($types)->toHaveCount(16)
            ->and($types)->not->toContain('details')
            ->and($types)->not->toContain('emoji');
    });

    it('resolves app-wide defaults through the hook, even for fields created earlier', function (): void {
        $field = RichEditor::make('body');

        RichEditor::defaultExtensionsUsing(fn (): array => [Bold::make(), Link::make()->openOnClick()]);

        expect(editorExtensions($field))->toBe([
            ['type' => 'bold', 'props' => []],
            ['type' => 'link', 'props' => ['protocols' => ['http', 'https', 'mailto'], 'openOnClick' => true]],
        ]);
    });

    it('serializes an explicitly empty set as an empty list', function (): void {
        expect(editorExtensions(RichEditor::make('body')->extensions([])))->toBe([]);
    });
});

describe('toolbar', function (): void {
    it('shows the toolbar by default and hides it via withoutToolbar', function (): void {
        expect(wire(RichEditor::make('body'))['props']['toolbar'])->toBeTrue()
            ->and(wire(RichEditor::make('body')->withoutToolbar())['props']['toolbar'])->toBeFalse();
    });
});

describe('docs fixtures', function (): void {
    it('matches the rich editor example fixture', function (): void {
        assertFixtureMatches('rich-editor.basic', Wire::toWire([
            RichEditor::make('article', 'Article')->placeholder('Write your article…'),
        ]));
    });

    it('matches the rich editor extensions example fixture', function (): void {
        assertFixtureMatches('rich-editor.extensions', Wire::toWire([
            RichEditor::make('summary', 'Summary')->extensions([
                Bold::make(),
                Italic::make(),
                Heading::make()->levels(2, 3),
                Link::make()->protocols('https', 'mailto'),
            ]),
        ]));
    });
});

it('resolves class-string extensions so their content survives casting', function (): void {
    $field = RichEditor::make('body')->extensions([BulletList::class, Bold::class]);
    $document = [
        'type' => 'doc',
        'content' => [[
            'type' => 'bulletList',
            'content' => [['type' => 'listItem', 'content' => [['type' => 'paragraph', 'content' => [
                ['type' => 'text', 'text' => 'Kept', 'marks' => [['type' => 'bold']]],
            ]]]]],
        ]],
    ];

    expect(editorExtensionTypes($field))->toBe(['bullet-list', 'bold'])
        ->and($field->castValue($document)['content'][0]['type'])->toBe('bulletList');
});
