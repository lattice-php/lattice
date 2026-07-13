<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Heading;

test('registers and resolves a block by its AsBlock key', function (): void {
    app(BlockRegistry::class)->register([RegistryHeroBlock::class]);

    $block = app(BlockRegistry::class)->resolve('registry.hero');

    expect($block)->toBeInstanceOf(RegistryHeroBlock::class);
});

test('resolving an unknown block throws', function (): void {
    app(BlockRegistry::class)->resolve('registry.missing');
})->throws(UnknownComponent::class);

test('registering a block without the AsBlock attribute throws', function (): void {
    app(BlockRegistry::class)->register(RegistryUnmarkedBlock::class);
})->throws(InvalidArgumentException::class);

test('block hooks default to empty', function (): void {
    $block = new RegistryHeroBlock;

    expect($block->slots())->toBe([])
        ->and($block->inlineText())->toBe([])
        ->and($block->migrate(['title' => 'x'], 1))->toBe(['title' => 'x']);
});

#[AsBlock('registry.hero')]
final class RegistryHeroBlock extends BlockDefinition
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

final class RegistryUnmarkedBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make();
    }
}
