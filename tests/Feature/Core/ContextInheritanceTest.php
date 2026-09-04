<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Concerns\ResolvesContextModels;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Services\ContextScope;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\FormDefinition;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Models\Product;

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

test('a registered context key inherits even when inherited_keys is empty', function (): void {
    config()->set('lattice.context.inherited_keys', []);
    Lattice::context('tenant', fn (string $value): object => (object) ['value' => $value]);

    $form = wire(FormComponent::use(ContextInheritanceParentForm::class, ['tenant' => 'acme']));

    expect(wireNode($form, 'ctx-inherit.child'))->not->toBeNull()
        ->and(ContextInheritanceChildAction::$seen['definition_tenant'])->toBe('acme');
});

test('an object context value is normalized to its scalar and resolves back to a model in the child', function (): void {
    Lattice::context('product', Product::class);
    Lattice::forms([ContextInheritanceProductParentForm::class]);
    Lattice::actions([ContextInheritanceProductChildAction::class]);

    $product = Product::factory()->create(['name' => 'Acme Widget']);

    $form = wire(FormComponent::use(ContextInheritanceProductParentForm::class, ['product' => $product]));

    $child = wireNode($form, 'ctx-inherit.product-child');
    assert($child !== null);

    postJson('/lattice/actions/ctx-inherit.product-child', [], ['X-Lattice-Ref' => $child['props']['ref']])
        ->assertOk();

    expect(ContextInheritanceProductChildAction::$seenScalar)->toBe($product->getRouteKey())
        ->and(ContextInheritanceProductChildAction::$seenModelName)->toBe('Acme Widget');
});

test('an object under a key without a registered resolver throws', function (): void {
    Lattice::forms([ContextInheritanceProductParentForm::class]);
    Lattice::actions([ContextInheritanceProductChildAction::class]);

    expect(fn (): FormComponent => FormComponent::use(ContextInheritanceProductParentForm::class, ['product' => new stdClass]))
        ->toThrow(LogicException::class);
});

test('an enum context value under an unregistered key seals as its scalar and reads back via context()', function (): void {
    Lattice::actions([ContextInheritanceEnumAction::class]);

    $action = wire(ActionComponent::use(ContextInheritanceEnumAction::class, ['status' => ContextInheritanceStatus::Active]));

    postJson('/lattice/actions/ctx-inherit.enum-child', [], ['X-Lattice-Ref' => $action['props']['ref']])
        ->assertOk();

    expect(ContextInheritanceEnumAction::$seenStatus)->toBe('active');
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

#[AsForm('ctx-inherit.product-parent-form')]
final class ContextInheritanceProductParentForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            ActionComponent::use(ContextInheritanceProductChildAction::class),
        ]);
    }

    public function handle(Request $request): Response
    {
        return new Response('ok');
    }
}

#[AsAction('ctx-inherit.product-child')]
final class ContextInheritanceProductChildAction extends ActionDefinition
{
    use ResolvesContextModels;

    public static mixed $seenScalar = null;

    public static ?string $seenModelName = null;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Product child');
    }

    public function handle(Request $request): ActionResult
    {
        self::$seenScalar = $this->context('product');

        $product = $this->contextModel('product');
        assert($product instanceof Product);
        self::$seenModelName = $product->name;

        return ActionResult::success();
    }
}

enum ContextInheritanceStatus: string
{
    case Active = 'active';
}

#[AsAction('ctx-inherit.enum-child')]
final class ContextInheritanceEnumAction extends ActionDefinition
{
    public static mixed $seenStatus = null;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Enum child');
    }

    public function handle(Request $request): ActionResult
    {
        self::$seenStatus = $this->context('status');

        return ActionResult::success();
    }
}
