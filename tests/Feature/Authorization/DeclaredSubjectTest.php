<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Facades\Lattice;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form as FormComponent;
use Lattice\Form\FormDefinition;
use Lattice\Http\Middleware\AuthorizeGateSubject;
use Lattice\Http\Page;
use Lattice\LatticeServiceProvider;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\PageSchema;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Workbench\App\Models\Product;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    Lattice::context('product', Product::class);
    Lattice::actions([DeclaredSubjectAction::class]);

    DeclaredSubjectPage::$productId = null;

    Route::get('declared-subject-test', [DeclaredSubjectPage::class, 'render'])
        ->middleware('web')
        ->name('declared-subject-test.show');

    withoutVite();
});

/**
 * Depth-first search of a wire payload for a schema entry by its `key` prop
 * — plain UI components (Heading included) carry `key`, not the `id` {@see
 * wireNode()} matches on.
 *
 * @param  array<array-key, mixed>  $node
 * @return array<array-key, mixed>|null
 */
function wireNodeByKey(array $node, string $key): ?array
{
    if (($node['key'] ?? null) === $key) {
        return $node;
    }

    foreach ($node as $value) {
        if (is_array($value) && ($found = wireNodeByKey($value, $key)) !== null) {
            return $found;
        }
    }

    return null;
}

function allowUpdateFor(?Product $allowed): void
{
    Gate::define('update', static fn (mixed $user, Product $product): bool => $allowed instanceof Product && $product->is($allowed));

    actingAs(workbenchTestUser());
}

test('a declared can+on gate authorizes the endpoint against the resolved context model, passing the record to the gate closure', function (): void {
    $allowed = Product::factory()->create();
    $denied = Product::factory()->create();

    $seen = [];
    Gate::define('update', function (mixed $user, Product $product) use (&$seen, $allowed): bool {
        $seen[] = $product;

        return $product->is($allowed);
    });
    actingAs(workbenchTestUser());

    $allowedRef = sealedRef('action', 'declared.subject-action', ['product' => $allowed->getKey()]);
    $deniedRef = sealedRef('action', 'declared.subject-action', ['product' => $denied->getKey()]);

    postJson('/lattice/actions/declared.subject-action', [], ['X-Lattice-Ref' => $allowedRef])->assertOk();
    postJson('/lattice/actions/declared.subject-action', [], ['X-Lattice-Ref' => $deniedRef])->assertForbidden();

    expect($seen)->toHaveCount(2)
        ->and($seen[0]->is($allowed))->toBeTrue()
        ->and($seen[1]->is($denied))->toBeTrue();
});

test('a declared can+on gate authorizes the endpoint when the context value is passed as a model', function (): void {
    $allowed = Product::factory()->create();

    allowUpdateFor($allowed);

    $this->callAction(DeclaredSubjectAction::class, [], ['product' => $allowed])->assertOk();
});

test('a declared can+on gate denies the endpoint when the context model passed does not satisfy the gate', function (): void {
    $allowed = Product::factory()->create();
    $denied = Product::factory()->create();

    allowUpdateFor($allowed);

    $this->callDeniedAction(DeclaredSubjectAction::class, [], ['product' => $denied])->assertForbidden();
});

test('a missing subject denies the endpoint even though the ability would otherwise pass', function (): void {
    Gate::define('update', static fn (mixed $user): bool => true);
    actingAs(workbenchTestUser());

    postJson(
        '/lattice/actions/declared.subject-action',
        [],
        ['X-Lattice-Ref' => sealedRef('action', 'declared.subject-action')],
    )->assertForbidden();
});

test('a declared can+on gate hides the component at render time and shows it once the subject is allowed', function (): void {
    $allowed = Product::factory()->create();
    $denied = Product::factory()->create();

    allowUpdateFor($allowed);

    DeclaredSubjectPage::$productId = $denied->getKey();
    $this->assertLatticePage(get('/declared-subject-test')->assertOk())
        ->assertNotRendered('action:declared.subject-action');

    DeclaredSubjectPage::$productId = $allowed->getKey();
    $this->assertLatticePage(get('/declared-subject-test')->assertOk())
        ->assertRendered('action:declared.subject-action');
});

test('a declared can+on gate hides the component when no subject is in context', function (): void {
    allowUpdateFor(null);

    DeclaredSubjectPage::$productId = null;
    $this->assertLatticePage(get('/declared-subject-test')->assertOk())
        ->assertNotRendered('action:declared.subject-action');
});

test('a component declaring can(on:) inherits its subject from the definition frame it is built in', function (): void {
    Lattice::forms([DeclaredSubjectContainerForm::class]);

    $allowed = Product::factory()->create();
    $denied = Product::factory()->create();

    allowUpdateFor($allowed);

    $allowedForm = wire(FormComponent::use(DeclaredSubjectContainerForm::class, ['product' => $allowed]));
    expect(wireNodeByKey($allowedForm, 'subject-gated-heading'))->not->toBeNull();

    $deniedForm = wire(FormComponent::use(DeclaredSubjectContainerForm::class, ['product' => $denied]));
    expect(wireNodeByKey($deniedForm, 'subject-gated-heading'))->toBeNull();
});

test('a component declaring can(on:) is hidden outside any context frame', function (): void {
    $allowed = Product::factory()->create();

    allowUpdateFor($allowed);

    expect(Heading::make('x')->can('update', on: 'product')->shouldRender())->toBeFalse();
});

test('a second can() call naming a different subject throws', function (): void {
    Heading::make('x')->can('update', on: 'product')->can('inspect', on: 'other');
})->throws(InvalidArgumentException::class);

test('a page declaring can+on gates the route with can middleware carrying the subject parameter, and authorizes against the bound model', function (): void {
    Lattice::pages([DeclaredSubjectAttributePage::class]);
    new LatticeServiceProvider(app())->bootPages();

    $allowed = Product::factory()->create();
    $denied = Product::factory()->create();

    $route = namedRoute('declared-subject-page-test.show');
    expect($route->gatherMiddleware())->toContain(AuthorizeGateSubject::class.':view,product');

    allowUpdateFor($allowed);
    Gate::define('view', static fn (mixed $user, Product $product): bool => $product->is($allowed));

    get('/declared-subject-page-test/'.$allowed->getKey())->assertOk();
    get('/declared-subject-page-test/'.$denied->getKey())->assertForbidden();
});

test('a page whose on key is resolver-backed only is authorized by AuthorizeGateSubject against the unbound scalar route parameter', function (): void {
    Lattice::pages([DeclaredSubjectScalarRoutePage::class]);
    new LatticeServiceProvider(app())->bootPages();

    $allowed = Product::factory()->create();
    $denied = Product::factory()->create();

    $route = namedRoute('declared-subject-scalar-page-test.show');
    expect($route->gatherMiddleware())->toContain(AuthorizeGateSubject::class.':view,product');

    allowUpdateFor($allowed);
    Gate::define('view', static fn (mixed $user, Product $product): bool => $product->is($allowed));

    get('/declared-subject-scalar-page-test/'.$allowed->getKey())->assertOk();
    get('/declared-subject-scalar-page-test/'.$denied->getKey())->assertForbidden();
});

test('toResponse() resolves a route-bound model into the gate subject', function (): void {
    $allowed = Product::factory()->create();
    $denied = Product::factory()->create();

    Gate::define('view', static fn (mixed $user, Product $product): bool => $product->is($allowed));
    actingAs(workbenchTestUser());

    $page = new DeclaredSubjectAttributePage;

    $allowedRoute = new RoutingRoute('GET', '/subject-bound/{product}', []);
    $allowedRequest = Request::create('/subject-bound/'.$allowed->getKey());
    $allowedRequest->setRouteResolver(static fn (): RoutingRoute => $allowedRoute);
    $allowedRoute->bind($allowedRequest);
    $allowedRoute->setParameter('product', $allowed);
    app()->instance('request', $allowedRequest);

    expect($page->toResponse($allowedRequest)->getStatusCode())->toBe(200);

    $deniedRoute = new RoutingRoute('GET', '/subject-bound/{product}', []);
    $deniedRequest = Request::create('/subject-bound/'.$denied->getKey());
    $deniedRequest->setRouteResolver(static fn (): RoutingRoute => $deniedRoute);
    $deniedRoute->bind($deniedRequest);
    $deniedRoute->setParameter('product', $denied);
    app()->instance('request', $deniedRequest);

    $status = null;

    try {
        $page->toResponse($deniedRequest);
    } catch (HttpException $exception) {
        $status = $exception->getStatusCode();
    }

    expect($status)->toBe(403);
});

test('toResponse() resolves an unbound scalar route parameter through the registered context resolver', function (): void {
    $allowed = Product::factory()->create();

    Gate::define('view', static fn (mixed $user, Product $product): bool => $product->is($allowed));
    actingAs(workbenchTestUser());

    $page = new DeclaredSubjectScalarPage;

    $route = new RoutingRoute('GET', '/subject-scalar/{product}', []);
    $request = Request::create('/subject-scalar/'.$allowed->getKey());
    $request->setRouteResolver(static fn (): RoutingRoute => $route);
    $route->bind($request);
    app()->instance('request', $request);

    expect($route->parameter('product'))->toBeString()
        ->and($page->toResponse($request)->getStatusCode())->toBe(200);
});

#[AsAction('declared.subject-action', can: 'update', on: 'product')]
final class DeclaredSubjectAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Declared subject action');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }
}

final class DeclaredSubjectPage extends Page
{
    public static ?int $productId = null;

    public function title(): string
    {
        return 'Declared subject';
    }

    public function render(PageSchema $schema): PageSchema
    {
        $context = self::$productId === null ? [] : ['product' => self::$productId];

        return $schema->schema([
            ActionComponent::use(DeclaredSubjectAction::class, $context),
        ]);
    }
}

#[AsForm('declared-subject.container-form')]
final class DeclaredSubjectContainerForm extends FormDefinition
{
    public function definition(FormComponent $form, Request $request): FormComponent
    {
        return $form->schema([
            Heading::make('Gated child')->key('subject-gated-heading')->can('update', on: 'product'),
        ]);
    }

    public function handle(Request $request): Response
    {
        return new Response('ok');
    }
}

#[AsPage(route: '/declared-subject-page-test/{product}', name: 'declared-subject-page-test.show', middleware: 'web', can: 'view', on: 'product')]
final class DeclaredSubjectAttributePage extends Page
{
    public function title(): string
    {
        return 'Declared subject page';
    }

    public function render(PageSchema $schema, Product $product): PageSchema
    {
        return $schema->schema([]);
    }
}

#[AsPage(can: 'view', on: 'product')]
final class DeclaredSubjectScalarPage extends Page
{
    public function title(): string
    {
        return 'Declared subject scalar page';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([]);
    }
}

#[AsPage(route: '/declared-subject-scalar-page-test/{product}', name: 'declared-subject-scalar-page-test.show', middleware: 'web', can: 'view', on: 'product')]
final class DeclaredSubjectScalarRoutePage extends Page
{
    public function title(): string
    {
        return 'Declared subject scalar route page';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([]);
    }
}
