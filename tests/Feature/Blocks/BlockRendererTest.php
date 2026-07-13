<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockRenderer;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Section;
use Lattice\Lattice\Ui\Components\Text;

test('renders each stored row through its block definition in order', function (): void {
    app(BlockRegistry::class)->register([RendererHeroBlock::class]);

    $schema = app(BlockRenderer::class)->render([
        ['type' => 'renderer.hero', 'title' => 'First', 'body' => 'One'],
        ['type' => 'renderer.hero', 'title' => 'Second', 'body' => 'Two'],
    ]);

    $wire = wire($schema->renderable());

    expect($wire)->toHaveCount(2)
        ->and($wire[0]['type'])->toBe('section')
        ->and($wire[0]['schema'][0]['type'])->toBe('heading')
        ->and($wire[0]['schema'][0]['props']['text'])->toBe('First')
        ->and($wire[0]['schema'][1]['props']['text'])->toBe('One')
        ->and($wire[1]['schema'][0]['props']['text'])->toBe('Second');
});

test('renders a placeholder for an unknown block type without throwing', function (): void {
    app(BlockRegistry::class)->register([RendererHeroBlock::class]);

    $schema = app(BlockRenderer::class)->render([
        ['type' => 'renderer.hero', 'title' => 'Kept', 'body' => 'Body'],
        ['type' => 'renderer.gone', 'headline' => 'Legacy data'],
    ]);

    $wire = wire($schema->renderable());

    expect($wire)->toHaveCount(2)
        ->and($wire[0]['type'])->toBe('section')
        ->and($wire[1]['type'])->toBe('text')
        ->and($wire[1]['props']['text'])->toBe('Unknown block [renderer.gone]');
});

#[AsBlock('renderer.hero')]
final class RendererHeroBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [TextInput::make('title'), TextInput::make('body')];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(
            Section::make()->schema([
                Heading::make($data->string('title')),
                Text::make($data->string('body')),
            ]),
        );
    }
}
