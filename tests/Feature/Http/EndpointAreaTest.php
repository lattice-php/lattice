<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Http\Response as IlluminateResponse;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as Router;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Facades\Lattice;
use Lattice\Facades\Effects;
use Lattice\Form\Attributes\AsForm;
use Lattice\Form\Components\Form;
use Lattice\Form\Components\TextInput;
use Lattice\Form\FormDefinition;
use Lattice\Http\LatticeResponse;
use Lattice\Http\Middleware\UseEndpointArea;
use Lattice\Http\Page;
use Lattice\LatticeServiceProvider;
use Lattice\Support\Testing\ComponentNode;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Tests\TestCase;
use Lattice\Ui\Enums\HttpMethod;
use Lattice\Ui\PageSchema;
use Symfony\Component\HttpFoundation\Response;

use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();

    config(['auth.guards.account' => ['driver' => 'session', 'provider' => 'users']]);

    Lattice::endpoints('account', prefix: 'account/lattice', middleware: ['web', 'auth:account']);
    Lattice::forms([AreaNameForm::class]);
    Lattice::tables([AreaTokensTable::class]);
    Lattice::actions([AreaRevokeTokenAction::class]);
    Lattice::pages([AreaAccountPage::class, AreaConsolePage::class]);

    new LatticeServiceProvider(app())->bootPages();

    AreaNameForm::$submitted = null;
});

test('a page in an endpoint area mints its component endpoints and ref refresh there', function (): void {
    $user = workbenchTestUser();
    $page = $this->actingAs($user, 'account')->get('/area/account')->assertOk();
    $schema = areaSchema($page);

    expect(areaForm($schema)->prop('action'))->toBe('/account/lattice/forms/area.name')
        ->and(areaTable($schema)->prop('endpoint'))->toBe('/account/lattice/tables/area.tokens')
        ->and(areaRowAction(areaTable($schema)->prop('data'))['props']['endpoint'])->toBe('/account/lattice/actions/area.revoke-token')
        ->and(data_get(AssertableInertia::fromTestResponse($page)->toArray(), 'props.lattice.urls.refreshRef'))->toBe('/account/lattice/refs/refresh');
});

test('a page outside every area keeps minting the default endpoints', function (): void {
    $user = workbenchTestUser();
    $page = $this->actingAs($user)->get('/area/console')->assertOk();

    expect(areaForm(areaSchema($page))->prop('action'))->toBe('/lattice/forms/area.name')
        ->and(data_get(AssertableInertia::fromTestResponse($page)->toArray(), 'props.lattice.urls.refreshRef'))->toBe('/lattice/refs/refresh');
});

test('an area mounts every endpoint below its prefix behind its own middleware and leaves the default routes alone', function (): void {
    $routes = app('router')->getRoutes();
    $area = $routes->getByName('lattice.account.forms.handle');
    $default = $routes->getByName('lattice.forms.handle');

    assert($area instanceof Route && $default instanceof Route);

    expect($area->uri())->toBe('account/lattice/forms/{form}')
        ->and($area->gatherMiddleware())->toBe(['web', 'auth:account'])
        ->and($default->uri())->toBe('lattice/forms/{form}')
        ->and($default->gatherMiddleware())->toBe(config('lattice.forms.middleware'))
        ->and($routes->getByName('lattice.account.refs.refresh')?->uri())->toBe('account/lattice/refs/refresh')
        ->and($routes->getByName('lattice.account.tables.show')?->uri())->toBe('account/lattice/tables/{table}')
        ->and($routes->getByName('lattice.account.actions.handle')?->uri())->toBe('account/lattice/actions/{action}')
        ->and($routes->getByName('lattice.account.bulk-actions.handle')?->uri())->toBe('account/lattice/bulk-actions/{bulkAction}')
        ->and($routes->getByName('lattice.account.fragments.show')?->uri())->toBe('account/lattice/fragments/{fragment}')
        ->and($routes->getByName('lattice.account.remote-sources.token')?->uri())->toBe('account/lattice/remote-sources/{source}/token');
});

test('an area endpoint accepts the session its own guard signed in', function (): void {
    $user = workbenchTestUser();
    $page = $this->actingAs($user, 'account')->get('/area/account')->assertOk();
    $form = areaForm(areaSchema($page));

    areaRequestIn($page, $this)
        ->patchJson((string) $form->prop('action'), ['name' => 'Ada'], ['X-Lattice-Ref' => (string) $form->prop('ref')])
        ->assertOk();

    expect(AreaNameForm::$submitted)->toBe('Ada');
});

test('an area endpoint refuses a user signed in only through the default guard', function (): void {
    $user = workbenchTestUser();
    $page = $this->actingAs($user, 'account')->get('/area/account')->assertOk();
    $form = areaForm(areaSchema($page));

    app('auth')->forgetGuards();
    app('auth')->shouldUse('web');

    areaRequestIn($page, $this)
        ->actingAs($user, 'web')
        ->patchJson((string) $form->prop('action'), ['name' => 'Ada'], ['X-Lattice-Ref' => (string) $form->prop('ref')])
        ->assertUnauthorized();

    expect(AreaNameForm::$submitted)->toBeNull();
});

test('a ref minted in an area is refused by the default endpoints and their ref refresh', function (): void {
    $user = workbenchTestUser();
    $page = $this->actingAs($user, 'account')->get('/area/account')->assertOk();
    $ref = (string) areaForm(areaSchema($page))->prop('ref');

    areaRequestIn($page, $this)
        ->patchJson('/lattice/forms/area.name', ['name' => 'Ada'], ['X-Lattice-Ref' => $ref])
        ->assertForbidden();

    areaRequestIn($page, $this)
        ->postJson('/lattice/refs/refresh', ['ref' => $ref])
        ->assertForbidden();

    areaRequestIn($page, $this)
        ->postJson('/account/lattice/refs/refresh', ['ref' => $ref])
        ->assertOk();

    expect(AreaNameForm::$submitted)->toBeNull();
});

test('components an area endpoint builds while serving its request stay in the area', function (): void {
    $user = workbenchTestUser();
    $page = $this->actingAs($user, 'account')->get('/area/account')->assertOk();
    $table = areaTable(areaSchema($page));

    $rows = areaRequestIn($page, $this)
        ->getJson((string) $table->prop('endpoint'), ['X-Lattice-Ref' => (string) $table->prop('ref')])
        ->assertOk()
        ->json('data');

    expect(areaRowAction($rows)['props']['endpoint'])->toBe('/account/lattice/actions/area.revoke-token');
});

test('a route the page cannot annotate selects its endpoint area through middleware', function (): void {
    $user = workbenchTestUser();

    Router::get('/area/rendered', fn (): AreaConsolePage => new AreaConsolePage)
        ->middleware(['web', 'auth:account', UseEndpointArea::class.':account']);

    $page = $this->actingAs($user, 'account')->get('/area/rendered')->assertOk();

    expect(areaForm(areaSchema($page))->prop('action'))->toBe('/account/lattice/forms/area.name');
});

test('a page naming an unregistered endpoint area fails loudly', function (): void {
    $user = workbenchTestUser();
    Lattice::pages([AreaUnknownPage::class]);
    new LatticeServiceProvider(app())->bootPages();

    $this->withoutExceptionHandling();

    expect(fn () => $this->actingAs($user)->get('/area/unknown'))
        ->toThrow(InvalidArgumentException::class, 'Lattice endpoint area [missing] is not registered.');
});

/**
 * @param  TestResponse<IlluminateResponse>  $page
 */
function areaSchema(TestResponse $page): ComponentNode
{
    $schema = data_get(AssertableInertia::fromTestResponse($page)->toArray(), 'props.lattice.schema');

    return ComponentNode::root(is_array($schema) ? $schema : []);
}

function areaForm(ComponentNode $schema): ComponentNode
{
    return $schema->firstOfTypeOrFail('form', 'area.name');
}

function areaTable(ComponentNode $schema): ComponentNode
{
    return $schema->firstOfTypeOrFail('table', 'area.tokens');
}

/**
 * @return array<string, mixed>
 */
function areaRowAction(mixed $rows): array
{
    $action = data_get($rows, '0.actions.0');
    assert(is_array($action));

    return $action;
}

/**
 * The refs a page seals are bound to its session, so the follow-up request
 * has to carry the session cookie the page started.
 *
 * @param  TestResponse<Response>  $page
 */
function areaRequestIn(TestResponse $page, TestCase $test): TestCase
{
    $cookie = (string) config('session.cookie');

    return $test->withCredentials()->withCookie($cookie, (string) $page->getCookie($cookie)?->getValue());
}

#[AsForm('area.name')]
final class AreaNameForm extends FormDefinition
{
    public static ?string $submitted = null;

    public function definition(Form $form, Request $request): Form
    {
        return $form->method(HttpMethod::Patch)->async()->schema([TextInput::make('name')]);
    }

    public function handle(Request $request): LatticeResponse
    {
        self::$submitted = $request->string('name')->toString();

        return Effects::respond()->toast('Saved');
    }
}

#[AsTable('area.tokens')]
final class AreaTokensTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            ['id' => 1, 'name' => 'CLI token'],
        ]));
    }

    #[Override]
    public function actions(array $row): array
    {
        return [Action::use(AreaRevokeTokenAction::class, ['token' => $row['id']])];
    }
}

#[AsAction('area.revoke-token')]
final class AreaRevokeTokenAction extends ActionDefinition
{
    public function definition(Action $action): Action
    {
        return $action->label('Revoke');
    }

    public function handle(): ActionResult
    {
        return ActionResult::success();
    }
}

#[AsPage(route: '/area/account', name: 'area.account', middleware: 'auth:account', endpoints: 'account')]
final class AreaAccountPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([Form::use(AreaNameForm::class), Table::use(AreaTokensTable::class)]);
    }
}

#[AsPage(route: '/area/console', name: 'area.console', middleware: 'auth')]
final class AreaConsolePage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([Form::use(AreaNameForm::class)]);
    }
}

#[AsPage(route: '/area/unknown', name: 'area.unknown', endpoints: 'missing')]
final class AreaUnknownPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([]);
    }
}
