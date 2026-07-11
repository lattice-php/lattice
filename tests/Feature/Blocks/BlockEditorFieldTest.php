<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Blocks\Slot;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\BlockEditor;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Grid;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Enums\Icon;

test('serializes as a block-editor field with a template per block', function (): void {
    $field = BlockEditor::make('content')->blocks([EditorHeroBlock::class]);

    $wire = wire($field);

    expect($wire['type'])->toBe('field.block-editor')
        ->and($wire['props']['endpoint'])->toBe('/lattice/blocks/render')
        ->and($wire['templates'])->toHaveCount(1)
        ->and($wire['templates'][0]['type'])->toBe('editor.hero')
        ->and($wire['templates'][0]['schema'][0]['props']['name'])->toBe('title');
});

test('serializes the declared slots on each template', function (): void {
    $field = BlockEditor::make('content')->blocks([EditorHeroBlock::class, EditorColumnsBlock::class]);

    $wire = wire($field);

    expect($wire['templates'][0])->not->toHaveKey('slots')
        ->and($wire['templates'][1]['type'])->toBe('editor.columns')
        ->and($wire['templates'][1]['slots'])->toBe([['name' => 'main']]);
});

test('serializes the block metadata onto its template', function (): void {
    $field = BlockEditor::make('content')->blocks([EditorLabelledBlock::class]);

    $wire = wire($field);

    expect($wire['templates'][0]['label'])->toBe('Big hero')
        ->and($wire['templates'][0]['icon'])->toBe('layout-dashboard')
        ->and($wire['templates'][0]['description'])->toBe('A prominent heading.');
});

test('falls back to a headline label and omits missing metadata', function (): void {
    $field = BlockEditor::make('content')->blocks([EditorHeroBlock::class]);

    $wire = wire($field);

    expect($wire['templates'][0]['label'])->toBe('Hero')
        ->and($wire['templates'][0])->not->toHaveKey('icon')
        ->and($wire['templates'][0])->not->toHaveKey('description');
});

test('serializes the label of a labelled slot', function (): void {
    $field = BlockEditor::make('content')->blocks([EditorHeroBlock::class, EditorLabelledColumnsBlock::class]);

    $wire = wire($field);

    expect($wire['templates'][1]['slots'])->toBe([
        ['name' => 'main', 'label' => 'Main column', 'blocks' => ['editor.hero']],
    ]);
});

test('serializes the allowed block types of a restricted slot', function (): void {
    $field = BlockEditor::make('content')->blocks([EditorHeroBlock::class, EditorRestrictedColumnsBlock::class]);

    $wire = wire($field);

    expect($wire['templates'][1]['slots'])->toBe([['name' => 'main', 'blocks' => ['editor.hero']]]);
});

test('rejects a slot allowing a block the editor does not offer', function (): void {
    BlockEditor::make('content')->blocks([EditorRestrictedColumnsBlock::class]);
})->throws(LogicException::class, 'editor.hero');

test('serializes rendered wire for each stored row aligned by index', function (): void {
    app(BlockRegistry::class)->register([EditorHeroBlock::class]);

    $field = BlockEditor::make('content')
        ->blocks([EditorHeroBlock::class])
        ->value([
            ['type' => 'editor.hero', 'title' => 'First'],
            ['type' => 'editor.hero', 'title' => 'Second'],
        ]);

    $wire = wire($field);

    expect($wire['rendered'])->toHaveCount(2)
        ->and($wire['rendered'][0]['wire'][0]['type'])->toBe('heading')
        ->and($wire['rendered'][0]['wire'][0]['props']['text'])->toBe('First')
        ->and($wire['rendered'][1]['wire'][0]['props']['text'])->toBe('Second');
});

test('serializes a rendered tree for slot children', function (): void {
    app(BlockRegistry::class)->register([EditorHeroBlock::class, EditorColumnsBlock::class]);

    $field = BlockEditor::make('content')
        ->blocks([EditorHeroBlock::class, EditorColumnsBlock::class])
        ->value([
            [
                'type' => 'editor.columns',
                'slots' => ['main' => [['type' => 'editor.hero', 'title' => 'Nested']]],
            ],
        ]);

    $wire = wire($field);

    expect($wire['rendered'][0]['wire'][0]['type'])->toBe('grid')
        ->and($wire['rendered'][0]['slots']['main'])->toHaveCount(1)
        ->and($wire['rendered'][0]['slots']['main'][0]['wire'][0]['type'])->toBe('heading')
        ->and($wire['rendered'][0]['slots']['main'][0]['wire'][0]['props']['text'])->toBe('Nested');
});

#[AsBlock('editor.hero')]
final class EditorHeroBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [TextInput::make('title')];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(Heading::make($data->string('title')));
    }
}

#[AsBlock('editor.columns')]
final class EditorColumnsBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [];
    }

    #[Override]
    public function slots(): array
    {
        return ['main'];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(Grid::make()->schema($slots->get('main')));
    }
}

#[AsBlock('editor.labelled')]
final class EditorLabelledBlock extends BlockDefinition
{
    #[Override]
    public function label(): ?string
    {
        return 'Big hero';
    }

    #[Override]
    public function icon(): Icon|string|null
    {
        return Icon::LayoutDashboard;
    }

    #[Override]
    public function description(): ?string
    {
        return 'A prominent heading.';
    }

    public function attributes(): array
    {
        return [TextInput::make('title')];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(Heading::make($data->string('title')));
    }
}

#[AsBlock('editor.labelled-columns')]
final class EditorLabelledColumnsBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [];
    }

    #[Override]
    public function slots(): array
    {
        return [Slot::make('main')->label('Main column')->blocks([EditorHeroBlock::class])];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(Grid::make()->schema($slots->get('main')));
    }
}

#[AsBlock('editor.restricted-columns')]
final class EditorRestrictedColumnsBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [];
    }

    #[Override]
    public function slots(): array
    {
        return [Slot::make('main')->blocks([EditorHeroBlock::class])];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(Grid::make()->schema($slots->get('main')));
    }
}
