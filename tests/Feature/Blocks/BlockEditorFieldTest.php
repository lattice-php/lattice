<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\BlockEditor;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;

test('serializes as a block-editor field with a template per block', function (): void {
    $field = BlockEditor::make('content')->blocks([EditorHeroBlock::class]);

    $wire = wire($field);

    expect($wire['type'])->toBe('field.block-editor')
        ->and($wire['blocks'])->toHaveCount(1)
        ->and($wire['blocks'][0]['type'])->toBe('editor.hero')
        ->and($wire['blocks'][0]['schema'][0]['props']['name'])->toBe('title');
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
