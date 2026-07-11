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
use Lattice\Lattice\Ui\Components\Heading;

use function Pest\Laravel\postJson;

beforeEach(function (): void {
    app(BlockRegistry::class)->register([EndpointHeroBlock::class]);
});

test('renders a block via the signed endpoint and returns wire', function (): void {
    $field = BlockEditor::make('content')->blocks([EndpointHeroBlock::class])->id('content');
    $ref = componentRef(wire($field));

    latticePost('/lattice/blocks/render', $ref, [
        'type' => 'endpoint.hero',
        'attributes' => ['title' => 'Live'],
    ])
        ->assertOk()
        ->assertJsonPath('wire.0.type', 'heading')
        ->assertJsonPath('wire.0.props.text', 'Live');
});

test('rejects an unsigned request', function (): void {
    postJson('/lattice/blocks/render', ['type' => 'endpoint.hero', 'attributes' => []])
        ->assertForbidden();
});

test('forbids rendering a block the field does not allow', function (): void {
    app(BlockRegistry::class)->register([EndpointHeroBlock::class, EndpointOtherBlock::class]);
    $field = BlockEditor::make('content')->blocks([EndpointHeroBlock::class])->id('content');
    $ref = componentRef(wire($field));

    latticePost('/lattice/blocks/render', $ref, [
        'type' => 'endpoint.other',
        'attributes' => [],
    ])->assertForbidden();
});

#[AsBlock('endpoint.hero')]
final class EndpointHeroBlock extends BlockDefinition
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

#[AsBlock('endpoint.other')]
final class EndpointOtherBlock extends BlockDefinition
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
