<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\RichEditor\EditorExtensionRegistry;
use Lattice\Lattice\Forms\RichEditor\Extensions\Blockquote;
use Lattice\Lattice\Forms\RichEditor\Extensions\Bold;
use Lattice\Lattice\Forms\RichEditor\Extensions\BulletList;
use Lattice\Lattice\Forms\RichEditor\Extensions\CodeBlock;
use Lattice\Lattice\Forms\RichEditor\Extensions\Details;
use Lattice\Lattice\Forms\RichEditor\Extensions\Emoji;
use Lattice\Lattice\Forms\RichEditor\Extensions\Heading;
use Lattice\Lattice\Forms\RichEditor\Extensions\Highlight;
use Lattice\Lattice\Forms\RichEditor\Extensions\HorizontalRule;
use Lattice\Lattice\Forms\RichEditor\Extensions\Italic;
use Lattice\Lattice\Forms\RichEditor\Extensions\Link;
use Lattice\Lattice\Forms\RichEditor\Extensions\OrderedList;
use Lattice\Lattice\Forms\RichEditor\Extensions\Strike;
use Lattice\Lattice\Forms\RichEditor\Extensions\Table;
use Lattice\Lattice\Forms\RichEditor\Extensions\TextAlign;
use Lattice\Lattice\Forms\RichEditor\Extensions\Underline;

it('wires the prop-less built-ins as a bare type', function (string $class, string $type): void {
    expect($class::make()->toWire())->toBe(['type' => $type]);
})->with([
    [Bold::class, 'bold'],
    [Italic::class, 'italic'],
    [Underline::class, 'underline'],
    [Strike::class, 'strike'],
    [Highlight::class, 'highlight'],
    [BulletList::class, 'bullet-list'],
    [OrderedList::class, 'ordered-list'],
    [Blockquote::class, 'blockquote'],
    [CodeBlock::class, 'code-block'],
    [HorizontalRule::class, 'horizontal-rule'],
    [Details::class, 'details'],
]);

it('wires heading with all six levels by default', function (): void {
    expect(Heading::make()->toWire())->toBe([
        'type' => 'heading',
        'props' => ['levels' => [1, 2, 3, 4, 5, 6]],
    ]);
});

it('restricts heading to the configured levels', function (): void {
    expect(Heading::make()->levels(1, 2, 3)->toWire())->toBe([
        'type' => 'heading',
        'props' => ['levels' => [1, 2, 3]],
    ]);
});

it('rejects a heading level outside 1-6', function (int $level): void {
    Heading::make()->levels($level);
})->with([0, 7, -1])->throws(InvalidArgumentException::class);

it('rejects an empty heading level list', function (): void {
    Heading::make()->levels();
})->throws(InvalidArgumentException::class);

it('wires link with its protocol and click defaults', function (): void {
    expect(Link::make()->toWire())->toBe([
        'type' => 'link',
        'props' => ['protocols' => ['http', 'https', 'mailto'], 'openOnClick' => false],
    ]);
});

it('restricts link to the configured protocols and toggles openOnClick', function (): void {
    expect(Link::make()->protocols('https', 'mailto')->openOnClick()->toWire())->toBe([
        'type' => 'link',
        'props' => ['protocols' => ['https', 'mailto'], 'openOnClick' => true],
    ]);
});

it('rejects an empty link protocol list', function (): void {
    Link::make()->protocols();
})->throws(InvalidArgumentException::class);

it('wires table with its insert defaults', function (): void {
    expect(Table::make()->toWire())->toBe([
        'type' => 'table',
        'props' => ['rows' => 3, 'cols' => 3, 'withHeaderRow' => true],
    ]);
});

it('configures the table insert shape', function (): void {
    expect(Table::make()->rows(2)->cols(5)->withHeaderRow(false)->toWire())->toBe([
        'type' => 'table',
        'props' => ['rows' => 2, 'cols' => 5, 'withHeaderRow' => false],
    ]);
});

it('rejects a table insert dimension below one', function (): void {
    Table::make()->rows(0);
})->throws(InvalidArgumentException::class);

it('rejects a table column count below one', function (): void {
    Table::make()->cols(0);
})->throws(InvalidArgumentException::class);

it('wires text-align with all four alignments by default', function (): void {
    expect(TextAlign::make()->toWire())->toBe([
        'type' => 'text-align',
        'props' => ['alignments' => ['left', 'center', 'right', 'justify']],
    ]);
});

it('restricts text-align to the configured alignments', function (): void {
    expect(TextAlign::make()->alignments('left', 'right')->toWire())->toBe([
        'type' => 'text-align',
        'props' => ['alignments' => ['left', 'right']],
    ]);
});

it('rejects an unknown alignment', function (): void {
    TextAlign::make()->alignments('top');
})->throws(InvalidArgumentException::class);

it('rejects an empty alignment list', function (): void {
    TextAlign::make()->alignments();
})->throws(InvalidArgumentException::class);

it('wires emoji with the default picker set', function (): void {
    $wire = Emoji::make()->toWire();

    expect($wire['type'])->toBe('emoji')
        ->and($wire['props']['emojis'])->toHaveCount(16)
        ->and($wire['props']['emojis'])->toContain('🚀');
});

it('restricts emoji to the configured set', function (): void {
    expect(Emoji::make()->emojis('🍕', '🌮')->toWire())->toBe([
        'type' => 'emoji',
        'props' => ['emojis' => ['🍕', '🌮']],
    ]);
});

it('rejects an empty emoji list', function (): void {
    Emoji::make()->emojis();
})->throws(InvalidArgumentException::class);

it('discovers every built-in extension', function (): void {
    $types = array_keys(EditorExtensionRegistry::withBuiltins()->all());
    sort($types);

    expect($types)->toBe([
        'blockquote',
        'bold',
        'bullet-list',
        'code-block',
        'details',
        'emoji',
        'heading',
        'highlight',
        'horizontal-rule',
        'italic',
        'link',
        'ordered-list',
        'strike',
        'table',
        'text-align',
        'underline',
    ]);
});
