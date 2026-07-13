<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockSlots;
use Lattice\Lattice\Blocks\Slot;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\BlockEditor;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Grid;
use Lattice\Lattice\Ui\Components\Heading;
use Symfony\Component\HttpFoundation\Response;

beforeEach(function (): void {
    app(BlockRegistry::class)->register([ValidationHeroBlock::class, ValidationColumnsBlock::class]);
});

function validationEditor(): BlockEditor
{
    return BlockEditor::make('content')->blocks([ValidationHeroBlock::class, ValidationColumnsBlock::class]);
}

test('rejects a row whose type is not an allowed block', function (): void {
    $field = validationEditor();

    $data = FormData::make(['content' => [['type' => 'not-a-block', 'title' => 'x']]]);
    $rules = $field->nestedRules($data, Request::create('/'));

    expect($rules)->toHaveKey('content.0.type')
        ->and($rules['content.0.type'][0])->toBe('required')
        ->and((string) $rules['content.0.type'][1])->toBe('in:"validation.hero","validation.columns"');
});

test('slot child rows validate through their own template', function (): void {
    $field = validationEditor();

    $data = FormData::make(['content' => [[
        'type' => 'validation.columns',
        'slots' => ['main' => [['type' => 'validation.hero', 'title' => 'Nested']]],
    ]]]);
    $rules = $field->nestedRules($data, Request::create('/'));

    expect($rules)->toHaveKey('content.0.slots')
        ->toHaveKey('content.0.slots.main')
        ->toHaveKey('content.0.slots.main.0.type')
        ->toHaveKey('content.0.slots.main.0.title')
        ->toHaveKey('content.0.slots.main.0.rowId')
        ->and((string) $rules['content.0.slots.main.0.type'][1])->toBe('in:"validation.hero","validation.columns"');
});

test('a restricted slot limits its child types to the allowed blocks', function (): void {
    app(BlockRegistry::class)->register([ValidationRestrictedColumnsBlock::class]);

    $field = BlockEditor::make('content')->blocks([
        ValidationHeroBlock::class,
        ValidationColumnsBlock::class,
        ValidationRestrictedColumnsBlock::class,
    ]);

    $data = FormData::make(['content' => [[
        'type' => 'validation.restricted-columns',
        'slots' => ['main' => [['type' => 'validation.columns']]],
    ]]]);
    $rules = $field->nestedRules($data, Request::create('/'));

    expect((string) $rules['content.0.slots.main.0.type'][1])->toBe('in:"validation.hero"');
});

test('an unrestricted slot accepts every editor block', function (): void {
    $field = validationEditor();

    $data = FormData::make(['content' => [[
        'type' => 'validation.columns',
        'slots' => ['main' => [['type' => 'validation.columns']]],
    ]]]);
    $rules = $field->nestedRules($data, Request::create('/'));

    expect((string) $rules['content.0.slots.main.0.type'][1])
        ->toBe('in:"validation.hero","validation.columns"');
});

test('a slotless row type gets no slot rules', function (): void {
    $field = validationEditor();

    $data = FormData::make(['content' => [['type' => 'validation.hero', 'slots' => ['main' => []]]]]);
    $rules = $field->nestedRules($data, Request::create('/'));

    expect($rules)->not->toHaveKey('content.0.slots');
});

test('casting preserves declared slot children and stamps row ids', function (): void {
    $field = validationEditor();

    $cast = $field->castValue([[
        'type' => 'validation.columns',
        'slots' => ['main' => [
            ['type' => 'validation.hero', 'title' => 'Nested', 'stray' => 'dropped'],
        ]],
    ]]);

    $child = $cast[0]['slots']['main'][0];

    expect($cast[0]['type'])->toBe('validation.columns')
        ->and($child['type'])->toBe('validation.hero')
        ->and($child['title'])->toBe('Nested')
        ->and($child)->not->toHaveKey('stray')
        ->and($child['rowId'])->toBeUuid();
});

test('casting drops stray slots on a slotless row type', function (): void {
    $field = validationEditor();

    $cast = $field->castValue([[
        'type' => 'validation.hero',
        'title' => 'Solo',
        'slots' => ['main' => [['type' => 'validation.hero', 'title' => 'Smuggled']]],
    ]]);

    expect($cast[0])->not->toHaveKey('slots');
});

test('a block schema must not declare a slots field', function (): void {
    app(BlockRegistry::class)->register([ValidationSlotsFieldBlock::class]);

    BlockEditor::make('content')->blocks([ValidationSlotsFieldBlock::class]);
})->throws(LogicException::class, 'slots');

test('submitted slot children survive validation and casting end to end', function (): void {
    Lattice::forms([ValidationBlockForm::class]);

    $this->submitForm(ValidationBlockForm::class, ['content' => [
        [
            'type' => 'validation.columns',
            'slots' => ['main' => [['type' => 'validation.hero', 'title' => 'Nested title']]],
        ],
    ]])->assertRedirect('/blocks-saved');

    $saved = session('validation-block-form.saved');

    expect($saved[0]['type'])->toBe('validation.columns')
        ->and($saved[0]['slots']['main'][0]['title'])->toBe('Nested title')
        ->and($saved[0]['slots']['main'][0]['rowId'])->toBeUuid();
});

test('an invalid slot child field fails validation with a nested error key', function (): void {
    Lattice::forms([ValidationBlockForm::class]);

    $this->submitForm(ValidationBlockForm::class, ['content' => [
        [
            'type' => 'validation.columns',
            'slots' => ['main' => [['type' => 'not-a-block', 'title' => 'x']]],
        ],
    ]])->assertUnprocessable()->assertJsonValidationErrors('content.0.slots.main.0.type');
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

#[AsBlock('validation.columns')]
final class ValidationColumnsBlock extends BlockDefinition
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

#[AsBlock('validation.restricted-columns')]
final class ValidationRestrictedColumnsBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [];
    }

    #[Override]
    public function slots(): array
    {
        return [Slot::make('main')->blocks([ValidationHeroBlock::class])];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make()->component(Grid::make()->schema($slots->get('main')));
    }
}

#[AsBlock('validation.slots-field')]
final class ValidationSlotsFieldBlock extends BlockDefinition
{
    public function attributes(): array
    {
        return [TextInput::make('slots')];
    }

    public function render(FormData $data, BlockSlots $slots): PageSchema
    {
        return PageSchema::make();
    }
}

#[AsForm('validation.block-form')]
final class ValidationBlockForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            BlockEditor::make('content')->blocks([ValidationHeroBlock::class, ValidationColumnsBlock::class]),
        ]);
    }

    public function handle(Request $request): Response
    {
        session()->flash('validation-block-form.saved', $this->validate($request)['content'] ?? []);

        return redirect('/blocks-saved');
    }
}
