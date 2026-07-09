<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\BlockEditor;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;

beforeEach(function (): void {
    app(BlockRegistry::class)->register([ValidationHeroBlock::class]);
});

test('rejects a row whose type is not an allowed block', function (): void {
    $field = BlockEditor::make('content')->blocks([ValidationHeroBlock::class]);

    $data = FormData::make(['content' => [['type' => 'not-a-block', 'title' => 'x']]]);
    $rules = $field->nestedRules($data, Request::create('/'));

    expect($rules)->toHaveKey('content.0.type')
        ->and($rules['content.0.type'])->toBe(['required', 'in:validation.hero']);
});

#[AsBlock('validation.hero')]
final class ValidationHeroBlock extends BlockDefinition
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
