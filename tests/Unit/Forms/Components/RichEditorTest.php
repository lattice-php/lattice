<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\RichEditor;
use Lattice\Lattice\Forms\RichEditor\Extensions\Bold;
use Lattice\Lattice\Forms\RichEditor\Extensions\Details;
use Lattice\Lattice\Forms\RichEditor\Extensions\Heading;
use Lattice\Lattice\Forms\RichEditor\Extensions\Italic;
use Lattice\Lattice\Forms\RichEditor\Extensions\Link;
use Lattice\Lattice\Forms\RichEditor\Extensions\Table;
use Lattice\Lattice\Support\Wire;

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
            'bold', 'italic', 'strike', 'underline', 'highlight',
            'heading',
            'bullet-list', 'ordered-list', 'blockquote', 'code-block', 'horizontal-rule',
            'text-align',
            'link',
            'table', 'details',
            'emoji',
        ]);
    });

    it('replaces the set and keeps the given order', function (): void {
        $field = RichEditor::make('body')->extensions([
            Bold::make(),
            Heading::make()->levels(1, 2),
            'mention',
        ]);

        expect(editorExtensions($field))->toBe([
            ['type' => 'bold'],
            ['type' => 'heading', 'props' => ['levels' => [1, 2]]],
            ['type' => 'mention'],
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
            ->toBe([['type' => 'mention']]);
    });

    it('dedupes by wire type, keeping the first position and the last configuration', function (): void {
        $field = RichEditor::make('body')->extensions([
            Heading::make()->levels(1),
            Bold::make(),
            Heading::make()->levels(2),
        ]);

        expect(editorExtensions($field))->toBe([
            ['type' => 'heading', 'props' => ['levels' => [2]]],
            ['type' => 'bold'],
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

        expect($types)->toHaveCount(17)
            ->and($types[0])->toBe('bold')
            ->and($types[16])->toBe('mention');
    });

    it('reconfigures a default extension in place', function (): void {
        $field = RichEditor::make('body')->withExtensions(Heading::make()->levels(2, 3));

        $extensions = editorExtensions($field);

        expect(array_column($extensions, 'type'))->toHaveCount(16)
            ->and($extensions[5])->toBe(['type' => 'heading', 'props' => ['levels' => [2, 3]]]);
    });

    it('subtracts by class-string and by wire type', function (): void {
        $types = editorExtensionTypes(
            RichEditor::make('body')->withoutExtensions(Details::class, 'emoji'),
        );

        expect($types)->toHaveCount(14)
            ->and($types)->not->toContain('details')
            ->and($types)->not->toContain('emoji');
    });

    it('resolves app-wide defaults through the hook, even for fields created earlier', function (): void {
        $field = RichEditor::make('body');

        RichEditor::defaultExtensionsUsing(fn (): array => [Bold::make(), Link::make()->openOnClick()]);

        expect(editorExtensions($field))->toBe([
            ['type' => 'bold'],
            ['type' => 'link', 'props' => ['protocols' => ['http', 'https', 'mailto'], 'openOnClick' => true]],
        ]);
    });

    it('serializes an explicitly empty set as an empty list', function (): void {
        expect(editorExtensions(RichEditor::make('body')->extensions([])))->toBe([]);
    });
});

describe('docs fixtures', function (): void {
    it('matches the rich editor example fixture', function (): void {
        assertFixtureMatches('rich-editor.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            RichEditor::make('article', 'Article')->placeholder('Write your article…'),
        ]))));
    });

    it('matches the rich editor extensions example fixture', function (): void {
        assertFixtureMatches('rich-editor.extensions', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            RichEditor::make('summary', 'Summary')->extensions([
                Bold::make(),
                Italic::make(),
                Heading::make()->levels(2, 3),
                Link::make()->protocols('https', 'mailto'),
            ]),
        ]))));

        expect('docs/fixtures/rich-editor.extensions.json')->toBeReadableFile();
    });
});
