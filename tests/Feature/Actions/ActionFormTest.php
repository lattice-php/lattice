<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Actions\FormActionDefinition;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Facades\Lattice;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\NumberInput;
use Lattice\Form\Components\Select;
use Lattice\Form\Components\Textarea;
use Lattice\Form\Components\TextInput;
use Lattice\Form\Components\Wizard;
use Lattice\Form\Components\WizardStep;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Enums\HttpMethod;
use Symfony\Component\HttpFoundation\Response;

use function Pest\Laravel\postJson;

it('marks a form-action component as lazy without inlining the schema', function (): void {
    Lattice::actions([EditActionFixture::class]);

    $payload = wire(ActionComponent::use(EditActionFixture::class));

    expect($payload['props']['lazyForm'])->toBeTrue()
        ->and($payload['props']['form'])->toBeNull();
});

it('returns a prefilled schema for a lazy form action', function (): void {
    Lattice::actions([EditActionFixture::class]);

    $this->callAction(EditActionFixture::class, ['_sub' => 'schema'], ['current_title' => 'Existing'])
        ->assertOk()
        ->assertJsonPath('type', 'form')
        ->assertJsonPath('props.state.title', 'Existing');
});

it('validates submitted values against a lazy form schema', function (): void {
    Lattice::actions([EditActionFixture::class]);
    $ref = $this->latticeRef(wire(ActionComponent::use(EditActionFixture::class)->context(['current_title' => 'Existing'])));

    postJson('/lattice/actions/test.edit', ['title' => ''], $this->latticeHeaders($ref))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('title');

    postJson('/lattice/actions/test.edit', ['title' => 'Renamed'], $this->latticeHeaders($ref))
        ->assertOk()
        ->assertJsonPath('data.title', 'Renamed');
});

#[AsAction('test.edit')]
class EditActionFixture extends FormActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Edit')->method(HttpMethod::Patch);
    }

    public function formSchema(FormComponent $form, Request $request): FormComponent
    {
        return $form
            ->schema([TextInput::make('title', 'Title')->required()])
            ->fill(['title' => $this->context('current_title')]);
    }

    public function handle(FormData $data): ActionResult
    {
        return ActionResult::success($data->all());
    }
}

it('validates the embedded form and hands the data to handle', function (): void {
    Lattice::actions([RejectActionFixture::class]);

    $this->callAction(RejectActionFixture::class, ['reason' => 'spam'])
        ->assertOk()
        ->assertJsonPath('data.reason', 'spam');
});

it('rejects an invalid embedded form with a 422', function (): void {
    Lattice::actions([RejectActionFixture::class]);

    $this->callAction(RejectActionFixture::class, ['reason' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('reason');
});

it('validates final embedded form submissions before handle is called', function (): void {
    Lattice::actions([UnvalidatedRejectActionFixture::class]);

    $this->callAction(UnvalidatedRejectActionFixture::class, ['reason' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('reason');

    expect(session('handled-unvalidated-reject'))->toBeNull();
});

it('validates the embedded form precognitively without running handle', function (): void {
    Lattice::actions([RejectActionFixture::class]);
    $ref = $this->latticeRef(wire(ActionComponent::use(RejectActionFixture::class)));

    $precognition = array_merge($this->latticeHeaders($ref), [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'reason',
    ]);

    postJson('/lattice/actions/test.reject', ['reason' => 'this reason is far too long'], $precognition)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('reason');

    postJson('/lattice/actions/test.reject', ['reason' => 'ok'], $precognition)
        ->assertNoContent();
});

it('suppresses the submit row of a wizard form action so only the wizard controls submit', function (): void {
    Lattice::actions([WizardActionFixture::class]);

    $this->callAction(WizardActionFixture::class, ['_sub' => 'schema'])
        ->assertOk()
        ->assertJsonPath('type', 'form')
        ->assertJsonPath('props.submitButton', false)
        ->assertJsonPath('schema.0.type', 'wizard');
});

it('validates an embedded wizard step precognitively without running handle', function (): void {
    Lattice::actions([WizardActionFixture::class]);
    $ref = $this->latticeRef(wire(ActionComponent::use(WizardActionFixture::class)));

    postJson('/lattice/actions/test.wizard-checkout', ['name' => ''], array_merge($this->latticeHeaders($ref), [
        'Precognition' => 'true',
        'Precognition-Validate-Only' => 'name,name.*',
    ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name');
});

#[AsAction('test.wizard-checkout')]
class WizardActionFixture extends FormActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Checkout');
    }

    public function formSchema(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Wizard::make([
                WizardStep::make('customer')->schema([
                    TextInput::make('name', 'Name')->required(),
                ]),
                WizardStep::make('review'),
            ]),
        ]);
    }

    public function handle(FormData $data): ActionResult
    {
        return ActionResult::success($data->all());
    }
}

it('resolves searchable options for an embedded select', function (): void {
    Lattice::actions([AssignActionFixture::class]);

    $this->callAction(AssignActionFixture::class, ['_sub' => 'search', '_target' => 'owner', '_q' => 'taylor'])
        ->assertOk()
        ->assertJsonPath('options.0.label', 'Match: taylor')
        ->assertJsonPath('options.0.value', '7');
});

it('resolves computed fields for an embedded form', function (): void {
    Lattice::actions([AssignActionFixture::class]);

    $this->callAction(AssignActionFixture::class, ['_sub' => 'resolve', 'qty' => '5'])
        ->assertOk()
        ->assertJsonPath('values.total', 7.5);
});

#[AsAction('test.assign')]
class AssignActionFixture extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Assign')
            ->method(HttpMethod::Post)
            ->form([
                Select::make('owner', 'Owner')->searchable(
                    fn (string $search): array => [['label' => "Match: {$search}", 'value' => '7']],
                ),
                TextInput::make('qty', 'Qty'),
                TextInput::make('total', 'Total')->value(fn (FormData $data): float => $data->float('qty') * 1.5),
            ]);
    }

    public function handle(FormData $data): ActionResult
    {
        return ActionResult::success($data->all());
    }
}

#[AsAction('test.reject')]
class RejectActionFixture extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Reject')
            ->method(HttpMethod::Post)
            ->form([
                Textarea::make('reason', 'Reason')->required()->rules(['max:10']),
            ]);
    }

    public function handle(FormData $data): ActionResult
    {
        return ActionResult::success(['reason' => $data['reason']]);
    }
}

#[AsAction('test.unvalidated-reject')]
class UnvalidatedRejectActionFixture extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Reject')
            ->method(HttpMethod::Post)
            ->form([
                Textarea::make('reason', 'Reason')->required(),
            ]);
    }

    public function handle(Request $request): ActionResult
    {
        $request->session()->put('handled-unvalidated-reject', true);

        return ActionResult::success(['handled' => true]);
    }
}

it('nulls out an unauthorized form embedded in the action props', function (): void {
    Lattice::forms([DeniedEmbeddedFormFixture::class]);
    Lattice::actions([ActionWithDeniedEmbeddedFormFixture::class]);

    $payload = wire(ActionComponent::use(ActionWithDeniedEmbeddedFormFixture::class));

    expect($payload['props']['form'])->toBeNull();
});

#[AsForm('test.denied-embedded-form')]
class DeniedEmbeddedFormFixture extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([TextInput::make('title', 'Title')]);
    }

    public function handle(Request $request): Response
    {
        return new Response;
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[AsAction('test.action-with-denied-embedded-form')]
class ActionWithDeniedEmbeddedFormFixture extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        $action->form = FormComponent::use(DeniedEmbeddedFormFixture::class);

        return $action->label('Do it');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }
}

test('an action handle(FormData $data) echoes the validated and cast embedded form data', function (): void {
    Lattice::actions([EchoCastActionFixture::class]);

    $this->callAction(EchoCastActionFixture::class, ['qty' => '4'])
        ->assertOk()
        ->assertJsonPath('data.qty', 4);
});

#[AsAction('test.echo-cast')]
class EchoCastActionFixture extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Echo')->method(HttpMethod::Post)->form([
            NumberInput::make('qty', 'Qty')->rules(['required', 'integer']),
        ]);
    }

    public function handle(FormData $data): ActionResult
    {
        return ActionResult::success(['qty' => $data->integer('qty')]);
    }
}

test('an embedded action form validates exactly once per call', function (): void {
    Lattice::actions([RuleCounterActionFixture::class]);
    RuleCounterActionFixture::$calls = 0;

    $this->callAction(RuleCounterActionFixture::class, ['name' => 'Ada'])->assertOk();

    expect(RuleCounterActionFixture::$calls)->toBe(1);
});

#[AsAction('test.rule-counter')]
class RuleCounterActionFixture extends ActionDefinition
{
    public static int $calls = 0;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Counter')->method(HttpMethod::Post)->form([
            TextInput::make('name', 'Name')->rules(function (): array {
                self::$calls++;

                return ['required', 'string'];
            }),
        ]);
    }

    public function handle(FormData $data): ActionResult
    {
        return ActionResult::success($data->all());
    }
}
