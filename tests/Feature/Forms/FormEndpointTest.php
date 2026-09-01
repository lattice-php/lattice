<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Lattice\Core\Facades\Lattice;
use Lattice\Facades\Effects;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\NumberInput;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;
use Lattice\Http\LatticeResponse;
use Lattice\Ui\Components\Text;
use Lattice\Ui\Enums\HttpMethod;
use Symfony\Component\HttpFoundation\Response;

use function Pest\Laravel\getJson;
use function Pest\Laravel\patch;
use function Pest\Laravel\patchJson;

test('endpoints honour the app base path for subdirectory installs', function (): void {
    URL::forceRootUrl('http://localhost/subdir');

    Lattice::forms([WorkbenchProfileForm::class]);

    $form = wire(Form::use(WorkbenchProfileForm::class));

    expect($form['props']['action'])->toBe('/subdir/lattice/forms/settings.profile');
});

test('registered forms serialize their configured endpoint and isolated error bag', function (): void {
    Lattice::forms([WorkbenchProfileForm::class]);

    $form = wire(Form::use(WorkbenchProfileForm::class));

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'settings.profile',
            'props' => [
                'action' => '/lattice/forms/settings.profile',
                'errorBag' => 'settings_profile',
                'method' => 'patch',
                'ref' => $this->latticeRef($form),
                'submitButton' => false,
                'submitLabel' => null,
                'submitJustify' => null,
                'submitVariant' => null,
                'submitEmphasis' => null,
                'submitButtons' => null,
                'validationSummaryLabel' => 'Fix these fields to continue:',
                'async' => false,
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

test('an async form submit gets its effects as json instead of a redirect', function (): void {
    Lattice::forms([WorkbenchAsyncProfileForm::class]);

    $ref = $this->latticeRef(wire(Form::use(WorkbenchAsyncProfileForm::class)));

    patchJson('/lattice/forms/workbench.async-profile', [
        'name' => 'Taylor',
    ], $this->latticeHeaders($ref))
        ->assertOk()
        ->assertJsonPath('effects.0.type', 'toast')
        ->assertJsonPath('effects.1.type', 'reload-component')
        ->assertJsonPath('effects.1.props.component', 'projects.summary');

    expect(session('handled-async-form'))->toBe('Taylor');
});

test('the submit helper keeps the redirect flow for a non-async form returning effects', function (): void {
    Lattice::forms([WorkbenchEffectsProfileForm::class]);

    $this->submitForm(WorkbenchEffectsProfileForm::class, ['name' => 'Taylor'])
        ->assertRedirect();

    expect(session('handled-effects-form'))->toBe('Taylor');
});

test('the submit helper receives effects json for an async form', function (): void {
    Lattice::forms([WorkbenchAsyncProfileForm::class]);

    $this->submitForm(WorkbenchAsyncProfileForm::class, ['name' => 'Taylor'])
        ->assertOk()
        ->assertJsonPath('effects.0.type', 'toast');
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

#[AsForm('workbench.effects-profile')]
class WorkbenchEffectsProfileForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            TextInput::make('name', 'Name'),
        ]);
    }

    public function handle(Request $request): LatticeResponse
    {
        $request->session()->put('handled-effects-form', $request->string('name')->toString());

        return Effects::respond()->toast('Saved.');
    }
}

#[AsForm('workbench.async-profile')]
class WorkbenchAsyncProfileForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form
            ->method(HttpMethod::Patch)
            ->async()
            ->schema([
                TextInput::make('name', 'Name')->required(),
            ]);
    }

    public function handle(Request $request): LatticeResponse
    {
        $request->session()->put('handled-async-form', $request->string('name')->toString());

        return Effects::respond()
            ->toast('Saved.')
            ->reloadComponent('projects.summary');
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

test('a rules closure resolves exactly once per submission', function (): void {
    Lattice::forms([RuleCounterForm::class]);
    RuleCounterForm::$calls = 0;

    $this->submitForm(RuleCounterForm::class, ['name' => 'Taylor'])->assertNoContent();

    expect(RuleCounterForm::$calls)->toBe(1);
});

#[AsForm('test.rule-counter')]
class RuleCounterForm extends FormDefinition
{
    public static int $calls = 0;

    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            TextInput::make('name', 'Name')->rules(function (): array {
                self::$calls++;

                return ['required', 'string'];
            }),
        ]);
    }

    public function handle(FormData $data): Response
    {
        return response()->noContent();
    }
}

test('handle receives cast, hidden-stripped, and server-injected form data', function (): void {
    Lattice::forms([ProcessedDataForm::class]);

    $this->submitForm(ProcessedDataForm::class, [
        'qty' => '5',
        'secret' => 'client-supplied',
    ])->assertOk();

    expect(session('processed-form-qty'))->toBe(5)
        ->and(session('processed-form-data'))->not->toHaveKey('secret')
        ->and(session('processed-form-data'))->toHaveKey('owner', 'server');
});

#[AsForm('test.processed-data')]
class ProcessedDataForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            NumberInput::make('qty', 'Qty')->rules(['required', 'integer']),
            TextInput::make('secret', 'Secret')->hidden()->required(),
            TextInput::make('owner', 'Owner')->readOnly()->value('server'),
        ]);
    }

    public function handle(FormData $data): Response
    {
        session()->put('processed-form-qty', $data->integer('qty'));
        session()->put('processed-form-data', $data->all());

        return response()->json(['handled' => true]);
    }
}

test('handle(FormData $data) receives the validated input', function (): void {
    Lattice::forms([FormDataOnlyHandlerForm::class]);

    $this->submitForm(FormDataOnlyHandlerForm::class, ['name' => 'Ada'])
        ->assertOk()
        ->assertJsonPath('name', 'Ada');
});

#[AsForm('test.handler.form-data')]
class FormDataOnlyHandlerForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([TextInput::make('name', 'Name')->required()]);
    }

    public function handle(FormData $data): Response
    {
        return response()->json(['name' => $data->get('name')]);
    }
}

test('handle(Request $request, FormData $data) resolves both parameters regardless of declared order', function (): void {
    Lattice::forms([SwappedOrderHandlerForm::class]);

    $this->submitForm(SwappedOrderHandlerForm::class, ['name' => 'Grace'])
        ->assertOk()
        ->assertJsonPath('name', 'Grace')
        ->assertJsonPath('method', 'POST');
});

#[AsForm('test.handler.swapped-order')]
class SwappedOrderHandlerForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([TextInput::make('name', 'Name')->required()]);
    }

    public function handle(Request $request, FormData $data): Response
    {
        return response()->json(['name' => $data->get('name'), 'method' => $request->method()]);
    }
}

final class GreetingService
{
    public function greet(string $name): string
    {
        return "Hello, {$name}!";
    }
}

test('handle(GreetingService $service, FormData $data) resolves a container service alongside the validated data', function (): void {
    Lattice::forms([ServiceHandlerForm::class]);

    $this->submitForm(ServiceHandlerForm::class, ['name' => 'Ada'])
        ->assertOk()
        ->assertJsonPath('greeting', 'Hello, Ada!');
});

#[AsForm('test.handler.service')]
class ServiceHandlerForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([TextInput::make('name', 'Name')->required()]);
    }

    public function handle(GreetingService $service, FormData $data): Response
    {
        return response()->json(['greeting' => $service->greet($data->get('name'))]);
    }
}

test('handle() with no parameters still runs', function (): void {
    Lattice::forms([NoParamHandlerForm::class]);

    $this->submitForm(NoParamHandlerForm::class, ['name' => 'Taylor'])->assertNoContent();

    expect(session('no-param-handler-ran'))->toBeTrue();
});

#[AsForm('test.handler.no-params')]
class NoParamHandlerForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([TextInput::make('name', 'Name')]);
    }

    public function handle(): Response
    {
        session()->put('no-param-handler-ran', true);

        return response()->noContent();
    }
}

test('a handle() return value that is not a Response or Responsable throws a LogicException', function (): void {
    Lattice::forms([BadReturnHandlerForm::class]);
    $this->withoutExceptionHandling();

    expect(fn () => $this->submitForm(BadReturnHandlerForm::class, ['name' => 'Ada']))
        ->toThrow(LogicException::class, 'must return a');
});

#[AsForm('test.handler.bad-return')]
class BadReturnHandlerForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([TextInput::make('name', 'Name')]);
    }

    public function handle(FormData $data): string
    {
        return 'not a response';
    }
}

test('a definition missing handle() throws a BadMethodCallException', function (): void {
    Lattice::forms([NoHandlerForm::class]);
    $this->withoutExceptionHandling();

    expect(fn () => $this->submitForm(NoHandlerForm::class, ['name' => 'Ada']))
        ->toThrow(BadMethodCallException::class, 'must declare a public handle()');
});

#[AsForm('test.handler.missing')]
class NoHandlerForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([TextInput::make('name', 'Name')]);
    }
}

test('the legacy handle(Request $request) signature still works', function (): void {
    Lattice::forms([WorkbenchProfileForm::class]);

    $this->submitForm(WorkbenchProfileForm::class, ['name' => 'Taylor'])
        ->assertRedirect('/submitted');

    expect(session('handled-form'))->toBe('Taylor');
});
