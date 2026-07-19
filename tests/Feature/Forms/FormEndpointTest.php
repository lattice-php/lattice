<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Ui\Components\Text;
use Symfony\Component\HttpFoundation\Response;

use function Pest\Laravel\getJson;
use function Pest\Laravel\patch;
use function Pest\Laravel\patchJson;

test('registered forms serialize their configured endpoint and isolated error bag', function (): void {
    config(['lattice.forms.endpoint' => 'custom/forms/{form}']);

    Lattice::forms([WorkbenchProfileForm::class]);

    $form = wire(Form::use(WorkbenchProfileForm::class));

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'settings.profile',
            'props' => [
                'action' => '/custom/forms/settings.profile',
                'errorBag' => 'settings_profile',
                'method' => 'patch',
                'ref' => $this->latticeRef($form),
                'submitButton' => false,
                'submitLabel' => null,
                'validationSummaryLabel' => 'Fix these fields to continue:',
                'precognitive' => false,
                'validationTimeout' => null,
                'resetOnSuccess' => null,
                'resetOnError' => null,
                'status' => null,
                'state' => [],
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Profile details',
                        'align' => null,
                        'size' => 'md',
                        'color' => null,
                        'copyable' => false,
                    ],
                ],
            ],
        ]);
});

test('registered forms can be submitted through the package endpoint', function (): void {
    Lattice::forms([WorkbenchProfileForm::class]);

    $this->submitForm(WorkbenchProfileForm::class, [
        'name' => 'Taylor',
        'context' => [
            'team' => 'tampered-team',
        ],
    ], ['team' => 'lattice-core'])
        ->assertRedirect('/submitted');

    expect(session('handled-form'))->toBe('Taylor');
    expect(session('handled-form-team'))->toBe('lattice-core');
});

test('registered form endpoints require a valid component reference', function (): void {
    Lattice::forms([WorkbenchProfileForm::class]);

    patch('/lattice/forms/settings.profile', ['name' => 'Taylor'])
        ->assertForbidden();

    patch('/lattice/forms/settings.profile', [
        'name' => 'Taylor',
    ], $this->latticeHeaders('tampered'))
        ->assertForbidden();
});

test('registered form submissions validate before handle is called', function (): void {
    Lattice::forms([WorkbenchRequiredProfileForm::class]);

    $ref = $this->latticeRef(wire(Form::use(WorkbenchRequiredProfileForm::class)));

    patchJson('/lattice/forms/workbench.required-profile', [], $this->latticeHeaders($ref))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name');

    expect(session('handled-required-profile'))->toBeNull();
});

test('registered forms receive the current request while serializing definitions', function (): void {
    Lattice::forms([WorkbenchRequestAwareForm::class]);

    Route::get('request-aware-form', fn () => response()->json(wire(Form::use(WorkbenchRequestAwareForm::class))))
        ->middleware('web');

    getJson('/request-aware-form?label=Request aware')
        ->assertOk()
        ->assertJsonPath('schema.0.props.text', 'Request aware');
});

test('a gate-hidden field is omitted from the form payload and its validation is skipped', function (): void {
    Lattice::forms([WorkbenchGateHiddenForm::class]);

    $schema = wire(Form::use(WorkbenchGateHiddenForm::class))['schema'];

    expect(array_map(fn (array $field): mixed => $field['props']['name'], $schema))->toBe(['name']);

    $this->submitForm(WorkbenchGateHiddenForm::class, ['name' => 'Taylor'])
        ->assertOk();

    expect(session('handled-gate-hidden-form'))->toBe('Taylor');
});

test('a field hidden by the condition DSL stays in the payload but its validation is still skipped', function (): void {
    Lattice::forms([WorkbenchConditionHiddenForm::class]);

    $schema = wire(Form::use(WorkbenchConditionHiddenForm::class))['schema'];

    expect(array_map(fn (array $field): mixed => $field['props']['name'], $schema))->toBe(['type', 'vat']);

    $this->submitForm(WorkbenchConditionHiddenForm::class, ['type' => 'individual'])
        ->assertOk();

    expect(session('handled-condition-hidden-form'))->toBe('individual');
});

#[AsForm('settings.profile')]
class WorkbenchProfileForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form
            ->method(HttpMethod::Patch)
            ->schema([
                Text::make('Profile details'),
            ])
            ->withoutSubmitButton();
    }

    public function handle(Request $request): Response
    {
        $request->session()->put('handled-form', $request->string('name')->toString());
        $request->session()->put('handled-form-team', $this->context('team'));

        return redirect('/submitted');
    }
}

#[AsForm('workbench.required-profile')]
class WorkbenchRequiredProfileForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form
            ->method(HttpMethod::Patch)
            ->schema([
                TextInput::make('name', 'Name')->required(),
            ]);
    }

    public function handle(Request $request): Response
    {
        $request->session()->put('handled-required-profile', true);

        return response()->json(['handled' => true]);
    }
}

#[AsForm('workbench.request-aware')]
class WorkbenchRequestAwareForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            Text::make($request->string('label', 'Fallback label')->toString()),
        ]);
    }

    public function handle(Request $request): Response
    {
        return response()->noContent();
    }
}

#[AsForm('workbench.gate-hidden')]
class WorkbenchGateHiddenForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            TextInput::make('name', 'Name'),
            TextInput::make('secret', 'Secret')->hidden()->required(),
        ]);
    }

    public function handle(Request $request): Response
    {
        $request->session()->put('handled-gate-hidden-form', $request->string('name')->toString());

        return response()->json(['handled' => true]);
    }
}

#[AsForm('workbench.condition-hidden')]
class WorkbenchConditionHiddenForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            TextInput::make('type', 'Type'),
            TextInput::make('vat', 'VAT ID')->visibleWhen('type', 'business')->required(),
        ]);
    }

    public function handle(Request $request): Response
    {
        $request->session()->put('handled-condition-hidden-form', $request->string('type')->toString());

        return response()->json(['handled' => true]);
    }
}
