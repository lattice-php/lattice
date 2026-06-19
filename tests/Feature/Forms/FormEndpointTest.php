<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Attributes\AsForm;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormDefinition;
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
                'ref' => componentRef($form),
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
                        'color' => 'muted',
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
    ], latticeHeaders('tampered'))
        ->assertForbidden();
});

test('registered form submissions validate before handle is called', function (): void {
    Lattice::forms([WorkbenchRequiredProfileForm::class]);

    $ref = componentRef(wire(Form::use(WorkbenchRequiredProfileForm::class)));

    patchJson('/lattice/forms/workbench.required-profile', [], latticeHeaders($ref))
        ->assertStatus(422)
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
