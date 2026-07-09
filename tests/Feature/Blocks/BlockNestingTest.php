<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockRenderer;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\FormData;

test('renders child rows declared in a layout block slot', function (): void {
    app(BlockRegistry::class)->register([NestingColumnsBlock::class, NestingTextBlock::class]);

    $schema = app(BlockRenderer::class)->render([
        [
            'type' => 'nesting.columns',
            'slots' => [
                'left' => [['type' => 'nesting.text', 'body' => 'Left side']],
                'right' => [['type' => 'nesting.text', 'body' => 'Right side']],
            ],
        ],
    ]);

    $wire = wire($schema->renderable());

    expect($wire)->toHaveCount(1)
        ->and($wire[0]['type'])->toBe('grid')
        ->and($wire[0]['schema'])->toHaveCount(2)
        ->and($wire[0]['schema'][0]['props']['text'])->toBe('Left side')
        ->and($wire[0]['schema'][1]['props']['text'])->toBe('Right side');
});

#[AsBlock('nesting.columns')]
final class NestingColumnsBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [];
    }

    #[Override]
    public function slots(): array
    {
        return ['left', 'right'];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(
            Grid::make()->schema([
                ...$slots->get('left'),
                ...$slots->get('right'),
            ]),
        );
    }
}

#[AsBlock('nesting.text')]
final class NestingTextBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(Text::make($data->string('body')));
    }
}
