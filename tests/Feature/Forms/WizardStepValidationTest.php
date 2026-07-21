<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\Select;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\Components\Wizard;
use Lattice\Lattice\Forms\Components\WizardStep;
use Lattice\Lattice\Forms\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

use function Pest\Laravel\postJson;

test('a precognitive request validates only the listed step fields', function (): void {
    Lattice::forms([WizardValidationTestForm::class]);
    $ref = $this->latticeRef(wire(Form::use(WizardValidationTestForm::class)));

    postJson('/lattice/forms/workbench.wizard-validation', [
        'name' => 'Taylor',
        'email' => 'not-an-email',
    ], $this->latticeHeaders($ref, [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'name,email',
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email')
        ->assertJsonMissingValidationErrors(['street', 'items']);
});

test('a passing step returns 204 without running handle, even when later steps are incomplete', function (): void {
    Lattice::forms([WizardValidationTestForm::class]);
    $ref = $this->latticeRef(wire(Form::use(WizardValidationTestForm::class)));

    postJson('/lattice/forms/workbench.wizard-validation', [
        'name' => 'Taylor',
        'email' => 'taylor@example.com',
    ], $this->latticeHeaders($ref, [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'name,email',
    ]))
        ->assertNoContent()
        ->assertHeader('Precognition-Success', 'true');

    expect(session('handled-wizard-validation'))->toBeNull();
});

test('expanded row paths match wildcard nested rules in a step validation', function (): void {
    Lattice::forms([WizardValidationTestForm::class]);
    $ref = $this->latticeRef(wire(Form::use(WizardValidationTestForm::class)));

    postJson('/lattice/forms/workbench.wizard-validation', [
        'items' => [
            ['sku' => '', 'qty' => 'many'],
        ],
    ], $this->latticeHeaders($ref, [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'items,items.0.sku,items.0.qty',
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['items.0.sku', 'items.0.qty'])
        ->assertJsonMissingValidationErrors(['name', 'email']);
});

test('wildcard validate-only patterns match concrete row rule keys', function (): void {
    Lattice::forms([WizardValidationTestForm::class]);
    $ref = $this->latticeRef(wire(Form::use(WizardValidationTestForm::class)));

    postJson('/lattice/forms/workbench.wizard-validation', [
        'items' => [
            ['sku' => '', 'qty' => 'many'],
        ],
    ], $this->latticeHeaders($ref, [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'items,items.*.sku,items.*.qty',
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['items.0.sku', 'items.0.qty'])
        ->assertJsonMissingValidationErrors(['name', 'email']);
});

test('wildcard validate-only patterns match wildcard item rule keys', function (): void {
    Lattice::forms([WizardValidationTestForm::class]);
    $ref = $this->latticeRef(wire(Form::use(WizardValidationTestForm::class)));

    postJson('/lattice/forms/workbench.wizard-validation', [
        'tags' => ['not-an-option'],
    ], $this->latticeHeaders($ref, [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'tags,tags.*',
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('tags.0')
        ->assertJsonMissingValidationErrors(['name', 'email']);
});

test('the final submit validates every step regardless of client step claims', function (): void {
    Lattice::forms([WizardValidationTestForm::class]);
    $ref = $this->latticeRef(wire(Form::use(WizardValidationTestForm::class)));

    postJson('/lattice/forms/workbench.wizard-validation', [
        'name' => 'Taylor',
        'email' => 'taylor@example.com',
    ], $this->latticeHeaders($ref))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('street');

    expect(session('handled-wizard-validation'))->toBeNull();
});

#[AsForm('workbench.wizard-validation')]
class WizardValidationTestForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            Wizard::make([
                WizardStep::make('customer')->schema([
                    TextInput::make('name', 'Name')->required(),
                    TextInput::make('email', 'Email')->rules(['required', 'email']),
                ]),
                WizardStep::make('items')->schema([
                    Repeater::make('items', 'Items')->schema([
                        TextInput::make('sku', 'SKU')->required(),
                        TextInput::make('qty', 'Quantity')->rules(['required', 'integer']),
                    ]),
                    Select::make('tags', 'Tags')
                        ->multiple()
                        ->options(['red' => 'Red', 'green' => 'Green', 'blue' => 'Blue'])
                        ->itemRules(['in:red,green,blue']),
                ]),
                WizardStep::make('address')->schema([
                    TextInput::make('street', 'Street')->required(),
                ]),
            ]),
        ]);
    }

    public function handle(Request $request): Response
    {
        $request->session()->put('handled-wizard-validation', true);

        return response()->json(['handled' => true]);
    }
}
