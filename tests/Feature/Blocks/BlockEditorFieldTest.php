<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\BlockEditor;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Grid;
use Lattice\Lattice\Ui\Components\Heading;

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
        ->and($wire['templates'][1]['slots'])->toBe(['main']);
});

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
        ->and($wire['rendered'][0][0]['type'])->toBe('heading')
        ->and($wire['rendered'][0][0]['props']['text'])->toBe('First')
        ->and($wire['rendered'][1][0]['props']['text'])->toBe('Second');
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
