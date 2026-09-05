<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Services\ContextResolutions;
use Lattice\Core\Services\ContextResolvers;
use Workbench\App\Models\Product;

beforeEach(function (): void {
    ContextResolverWidgetAction::$calls = 0;
});

test('has and keys reflect registered resolvers', function (): void {
    expect(app(ContextResolvers::class)->has('widget'))->toBeFalse()
        ->and(app(ContextResolvers::class)->keys())->not->toContain('widget');

    Lattice::context('widget', fn (string $value): ContextResolverWidget => new ContextResolverWidget($value));

    expect(app(ContextResolvers::class)->has('widget'))->toBeTrue()
        ->and(app(ContextResolvers::class)->keys())->toContain('widget');
});

test('registering the same key twice replaces the previous resolver', function (): void {
    Lattice::context('widget', fn (string $value): ContextResolverWidget => new ContextResolverWidget('first-'.$value));
    Lattice::context('widget', fn (string $value): ContextResolverWidget => new ContextResolverWidget('second-'.$value));

    $resolved = app(ContextResolutions::class)->resolve('widget', 'x', []);
    assert($resolved instanceof ContextResolverWidget);

    expect($resolved->id)->toBe('second-x');
});

test('a closure resolver is evaluated with named value, key and context, and a typed Request', function (): void {
    Lattice::context('widget', function (string $value, string $key, array $context, Request $request): ContextResolverWidget {
        expect($key)->toBe('widget')
            ->and($context)->toBe(['widget' => 'w1']);

        return new ContextResolverWidget($value);
    });

    $resolved = app(ContextResolutions::class)->resolve('widget', 'w1', ['widget' => 'w1']);
    assert($resolved instanceof ContextResolverWidget);

    expect($resolved->id)->toBe('w1');
});

test('the Eloquent sugar resolves by primary key and by an explicit column', function (): void {
    Lattice::context('product', Product::class);
    Lattice::context('product_by_sku', Product::class, by: 'sku');

    $product = Product::factory()->create(['sku' => 'SKU-1']);
    $resolutions = app(ContextResolutions::class);

    $byKey = $resolutions->resolve('product', (string) $product->getKey(), []);
    $bySku = $resolutions->resolve('product_by_sku', 'SKU-1', []);
    assert($byKey instanceof Product);
    assert($bySku instanceof Product);

    expect($byKey->getKey())->toBe($product->getKey())
        ->and($bySku->getKey())->toBe($product->getKey());
});

test('resolving an unregistered key throws', function (): void {
    expect(fn () => app(ContextResolutions::class)->resolve('nope', 'x', []))
        ->toThrow(LogicException::class, 'nope');
});

test('hasContext distinguishes a present key from an absent one', function (): void {
    Lattice::actions([ContextResolverPresenceAction::class]);

    $this->callAction(ContextResolverPresenceAction::class, [], ['widget' => 'w1'])
        ->assertOk()
        ->assertJsonPath('data.present', true)
        ->assertJsonPath('data.absent', false);
});

test('contextModel aborts with 404 when the key is absent', function (): void {
    Lattice::context('widget', fn (string $value): ?ContextResolverWidget => $value === 'missing' ? null : new ContextResolverWidget($value));
    Lattice::actions([ContextResolverNotFoundAction::class]);

    $this->callAction(ContextResolverNotFoundAction::class, [], [])
        ->assertNotFound();
});

test('contextModel aborts with 404 when the resolver finds nothing', function (): void {
    Lattice::context('widget', fn (string $value): ?ContextResolverWidget => $value === 'missing' ? null : new ContextResolverWidget($value));
    Lattice::actions([ContextResolverNotFoundAction::class]);

    $this->callAction(ContextResolverNotFoundAction::class, [], ['widget' => 'missing'])
        ->assertNotFound();
});

test('a resolver runs once for two contextModel reads in the same request', function (): void {
    Lattice::context('widget', function (string $value): ContextResolverWidget {
        ContextResolverWidgetAction::$calls++;

        return new ContextResolverWidget($value);
    });
    Lattice::actions([ContextResolverDoubleReadAction::class]);

    $this->callAction(ContextResolverDoubleReadAction::class, [], ['widget' => 'w1'])
        ->assertOk()
        ->assertJsonPath('data.same', true);

    expect(ContextResolverWidgetAction::$calls)->toBe(1);
});

test('a resolver runs once across authorize() and handle() of a callAction', function (): void {
    Lattice::context('widget', function (string $value): ContextResolverWidget {
        ContextResolverWidgetAction::$calls++;

        return new ContextResolverWidget($value);
    });
    Lattice::actions([ContextResolverWidgetAction::class]);

    $this->callAction(ContextResolverWidgetAction::class, [], ['widget' => 'w1'])
        ->assertOk()
        ->assertJsonPath('data.id', 'w1');

    expect(ContextResolverWidgetAction::$calls)->toBe(1);
});

test('serialize uses the registered key closure', function (): void {
    Lattice::context(
        'widget',
        fn (string $value): ContextResolverWidget => new ContextResolverWidget($value),
        keyBy: fn (ContextResolverWidget $widget): string => 'k-'.$widget->id,
    );

    $serialized = app(ContextResolutions::class)->serialize('widget', new ContextResolverWidget('w9'));

    expect($serialized)->toBe('k-w9');
});

test('serialize falls back to getRouteKey when no key closure is registered', function (): void {
    Lattice::context('product', fn (string $value): ?Product => Product::find($value));

    $product = Product::factory()->create();

    $serialized = app(ContextResolutions::class)->serialize('product', $product);

    expect($serialized)->toBe($product->getRouteKey());
});

test('serialize throws when neither a key closure nor getRouteKey is available', function (): void {
    Lattice::context('widget', fn (string $value): ContextResolverWidget => new ContextResolverWidget($value));

    expect(fn () => app(ContextResolutions::class)->serialize('widget', new ContextResolverWidget('w1')))
        ->toThrow(LogicException::class);
});

test('a resolver depends on another key through the typed ContextResolutions', function (): void {
    Lattice::context('widget', fn (string $value): ContextResolverWidget => new ContextResolverWidget($value));
    Lattice::context('gadget', function (array $context, ContextResolutions $resolutions): ContextResolverWidget {
        $widget = $resolutions->resolve('widget', $context['widget'], $context);
        assert($widget instanceof ContextResolverWidget);

        return $widget;
    });

    $resolved = app(ContextResolutions::class)->resolve('gadget', 'g1', ['widget' => 'w5', 'gadget' => 'g1']);
    assert($resolved instanceof ContextResolverWidget);

    expect($resolved->id)->toBe('w5');
});

test('a closure resolver records its declared return type as the model class for frame matching', function (): void {
    Lattice::context('widget', fn (string $value): ContextResolverWidget => new ContextResolverWidget($value));

    expect(app(ContextResolvers::class)->keyForModel(new ContextResolverWidget('x')))->toBe('widget');
});

test('a nullable return type still records the model class', function (): void {
    Lattice::context('widget', fn (string $value): ContextResolverWidget => new ContextResolverWidget($value));

    expect(app(ContextResolvers::class)->keyForModel(new ContextResolverWidget('x')))->toBe('widget');
});

test('a builtin return type records no class and an explicit model sets it', function (): void {
    Lattice::context('widget', fn (string $value): object => new ContextResolverWidget($value));

    expect(app(ContextResolvers::class)->keyForModel(new ContextResolverWidget('x')))->toBeNull();

    Lattice::context('widget', fn (string $value): object => new ContextResolverWidget($value), model: ContextResolverWidget::class);

    expect(app(ContextResolvers::class)->keyForModel(new ContextResolverWidget('x')))->toBe('widget');
});

final readonly class ContextResolverWidget
{
    public function __construct(public string $id) {}
}

#[AsAction('context-resolver.presence')]
final class ContextResolverPresenceAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Presence');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'present' => $this->hasContext('widget'),
            'absent' => $this->hasContext('missing'),
        ]);
    }
}

#[AsAction('context-resolver.not-found')]
final class ContextResolverNotFoundAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Not found');
    }

    public function handle(Request $request): ActionResult
    {
        $widget = $this->contextModel('widget');
        assert($widget instanceof ContextResolverWidget);

        return ActionResult::success(['id' => $widget->id]);
    }
}

#[AsAction('context-resolver.double-read')]
final class ContextResolverDoubleReadAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Double read');
    }

    public function handle(Request $request): ActionResult
    {
        $first = $this->contextModel('widget');
        $second = $this->contextModel('widget');

        return ActionResult::success(['same' => $first === $second]);
    }
}

#[AsAction('context-resolver.widget')]
final class ContextResolverWidgetAction extends ActionDefinition
{
    public static int $calls = 0;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Widget');
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return $this->contextModel('widget') instanceof ContextResolverWidget;
    }

    public function handle(Request $request): ActionResult
    {
        $widget = $this->contextModel('widget');
        assert($widget instanceof ContextResolverWidget);

        return ActionResult::success(['id' => $widget->id]);
    }
}
