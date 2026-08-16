<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Services\ContextScope;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\FormDefinition;
use Symfony\Component\HttpFoundation\Response;

use function Pest\Laravel\postJson;

beforeEach(function (): void {
    config()->set('lattice.context.inherited_keys', ['tenant']);
    ContextInheritanceChildAction::$seen = [];
    ContextInheritanceExplicitChildAction::$seenTenant = null;

    Lattice::forms([ContextInheritanceParentForm::class]);
    Lattice::actions([ContextInheritanceChildAction::class, ContextInheritanceExplicitChildAction::class]);
});

test('wrap frames nest cumulatively, filter to the whitelist, and pop even when the callback throws', function (): void {
    $scope = app(ContextScope::class);

    $scope->wrap(['tenant' => 'acme', 'secret' => 'hidden'], function () use ($scope): void {
        expect($scope->inheritable())->toBe(['tenant' => 'acme']);

        $scope->wrap([...$scope->inheritable(), 'tenant' => 'inner'], function () use ($scope): void {
            expect($scope->inheritable())->toBe(['tenant' => 'inner']);
        });

        expect($scope->inheritable())->toBe(['tenant' => 'acme']);
    });

    expect($scope->inheritable())->toBe([]);

    try {
        $scope->wrap(['tenant' => 'acme'], fn () => throw new RuntimeException('boom'));
    } catch (RuntimeException) {
    }

    expect($scope->inheritable())->toBe([]);
});

test('a child action built inside a form schema inherits whitelisted context through gate and definition', function (): void {
    $form = wire(FormComponent::use(ContextInheritanceParentForm::class, ['tenant' => 'acme', 'secret' => 'hidden']));

    expect(wireNode($form, 'ctx-inherit.child'))->not->toBeNull()
        ->and(ContextInheritanceChildAction::$seen['definition_tenant'])->toBe('acme')
        ->and(ContextInheritanceChildAction::$seen['definition_secret'])->toBeNull();
});

test('nothing is inherited when the whitelist is empty', function (): void {
    config()->set('lattice.context.inherited_keys', []);

    $form = wire(FormComponent::use(ContextInheritanceParentForm::class, ['tenant' => 'acme']));

    expect(wireNode($form, 'ctx-inherit.child'))->toBeNull();
});

test('explicit child context wins over the inherited value', function (): void {
    wire(FormComponent::use(ContextInheritanceParentForm::class, ['tenant' => 'acme']));

    expect(ContextInheritanceExplicitChildAction::$seenTenant)->toBe('other');
});

test('the reserved table key is never inherited, even when whitelisted', function (): void {
    config()->set('lattice.context.inherited_keys', ['tenant', 'table']);

    wire(FormComponent::use(ContextInheritanceParentForm::class, ['tenant' => 'acme', 'table' => 'evil']));

    expect(ContextInheritanceChildAction::$seen['definition_tenant'])->toBe('acme')
        ->and(ContextInheritanceChildAction::$seen['definition_table'])->toBeNull();
});

test('the sealed child ref carries inherited keys to the endpoint but never unlisted ones', function (): void {
    $form = wire(FormComponent::use(ContextInheritanceParentForm::class, ['tenant' => 'acme', 'secret' => 'hidden']));

    $child = wireNode($form, 'ctx-inherit.child');
    assert($child !== null);

    postJson('/lattice/actions/ctx-inherit.child', [], ['X-Lattice-Ref' => $child['props']['ref']])
        ->assertOk();

    expect(ContextInheritanceChildAction::$seen['handle_tenant'])->toBe('acme')
        ->and(ContextInheritanceChildAction::$seen['handle_secret'])->toBeNull();
});

#[AsForm('ctx-inherit.parent-form')]
final class ContextInheritanceParentForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            ActionComponent::use(ContextInheritanceChildAction::class),
            ActionComponent::use(ContextInheritanceExplicitChildAction::class, ['tenant' => 'other']),
        ]);
    }

    public function handle(Request $request): Response
    {
        return new Response('ok');
    }
}

#[AsAction('ctx-inherit.child')]
final class ContextInheritanceChildAction extends ActionDefinition
{
    /** @var array<string, mixed> */
    public static array $seen = [];

    public function definition(ActionComponent $action): ActionComponent
    {
        self::$seen['definition_tenant'] = $this->context('tenant');
        self::$seen['definition_secret'] = $this->context('secret');
        self::$seen['definition_table'] = $this->context('table');

        return $action->label('Child');
    }

    public function handle(Request $request): ActionResult
    {
        self::$seen['handle_tenant'] = $this->context('tenant');
        self::$seen['handle_secret'] = $this->context('secret');

        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return $this->context('tenant') === 'acme';
    }
}

#[AsAction('ctx-inherit.child-explicit')]
final class ContextInheritanceExplicitChildAction extends ActionDefinition
{
    public static ?string $seenTenant = null;

    public function definition(ActionComponent $action): ActionComponent
    {
        $tenant = $this->context('tenant');
        self::$seenTenant = is_string($tenant) ? $tenant : null;

        return $action->label('Explicit child');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }
}
