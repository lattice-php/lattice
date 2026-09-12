<?php

declare(strict_types=1);

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Facades\Lattice;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormData;
use Lattice\Form\FormDefinition;
use Lattice\Ui\Enums\Variant;
use Workbench\App\Models\User;

use function Pest\Laravel\actingAs;

abstract class EnrolmentForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            TextInput::make('code')->rules(['required', 'string']),
        ]);
    }

    public function handle(FormData $data): RedirectResponse
    {
        return redirect('/enrolled');
    }
}

#[AsForm('middleware.default')]
final class DefaultStackForm extends EnrolmentForm {}

#[AsForm('middleware.guest', middleware: ['web'])]
final class GuestStackForm extends EnrolmentForm {}

#[AsForm('middleware.guarded', middleware: ['web', 'auth'])]
final class GuardedStackForm extends EnrolmentForm {}

#[AsForm('middleware.guest-gated', can: 'enrol-second-factor', middleware: ['web'])]
final class GatedGuestStackForm extends EnrolmentForm {}

#[AsAction('middleware.guest-action', middleware: ['web'])]
final class GuestStackAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Enrol');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success()->toast('Enrolled.');
    }
}

beforeEach(function (): void {
    config(['lattice.forms.middleware' => ['web', 'auth'], 'lattice.actions.middleware' => ['web', 'auth']]);
});

test('a definition declaring no middleware runs behind the configured default', function (): void {
    Lattice::forms([DefaultStackForm::class]);

    $this->submitForm(DefaultStackForm::class, ['code' => '123456'])
        ->assertUnauthorized();

    actingAs(workbenchTestUser());

    $this->submitForm(DefaultStackForm::class, ['code' => '123456'])
        ->assertRedirect('/enrolled');
});

test('a definition declaring its own middleware replaces the configured default, so a guest reaches it', function (): void {
    Lattice::forms([GuestStackForm::class]);

    $this->submitForm(GuestStackForm::class, ['code' => '123456'])
        ->assertRedirect('/enrolled');
});

test('a definition declaring its own middleware can also add a guard the default omits', function (): void {
    config(['lattice.forms.middleware' => ['web']]);
    Lattice::forms([DefaultStackForm::class, GuardedStackForm::class]);

    $this->submitForm(DefaultStackForm::class, ['code' => '123456'])
        ->assertRedirect('/enrolled');

    $this->submitForm(GuardedStackForm::class, ['code' => '123456'])
        ->assertUnauthorized();
});

test('dropping auth from the stack does not drop the declared ability', function (): void {
    Lattice::forms([GatedGuestStackForm::class]);

    $this->submitDeniedForm(GatedGuestStackForm::class, ['code' => '123456'])
        ->assertForbidden();

    Gate::define('enrol-second-factor', fn (?User $user): bool => true);

    $this->submitForm(GatedGuestStackForm::class, ['code' => '123456'])
        ->assertRedirect('/enrolled');
});

test('declared middleware reaches every definition endpoint, not only forms', function (): void {
    Lattice::actions([GuestStackAction::class]);

    $this->callAction(GuestStackAction::class)
        ->assertOk()
        ->assertToast(Variant::Success, 'Enrolled.');
});
