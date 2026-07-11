<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Blocks\Casts\AsBlocks;
use Lattice\Lattice\Blocks\Concerns\HasBlocks;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Heading;

beforeEach(function (): void {
    Schema::create('landing_pages', function ($table): void {
        $table->id();
        $table->json('content')->nullable();
        $table->timestamps();
    });
});

test('persists a block tree and renders it back through the registry', function (): void {
    app(BlockRegistry::class)->register([HasBlocksHeroBlock::class]);

    $page = HasBlocksPage::create([
        'content' => [
            ['type' => 'has-blocks.hero', 'title' => 'Stored heading'],
        ],
    ]);

    $reloaded = HasBlocksPage::query()->whereKey($page->getKey())->firstOrFail();
    $wire = wire($reloaded->renderBlocks('content')->renderable());

    expect($reloaded->getAttribute('content'))->toBe([['type' => 'has-blocks.hero', 'title' => 'Stored heading']])
        ->and($wire)->toHaveCount(1)
        ->and($wire[0]['type'])->toBe('heading')
        ->and($wire[0]['props']['text'])->toBe('Stored heading');
});

class HasBlocksPage extends Model
{
    use HasBlocks;

    protected $table = 'landing_pages';

    protected $guarded = [];

    #[Override]
    protected function casts(): array
    {
        return ['content' => AsBlocks::class];
    }
}

#[AsBlock('has-blocks.hero')]
final class HasBlocksHeroBlock extends BlockDefinition
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
