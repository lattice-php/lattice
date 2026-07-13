<?php
declare(strict_types=1);

use Illuminate\Foundation\Auth\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Fragments\Components\Fragment;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Components\Text;
use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\Tables\PaginationPage;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;
use function Pest\Laravel\withSession;

test('tabs hydrate their active value from the request query string', function (): void {
    Route::get('query-tabs', [WorkbenchTabsPage::class, 'render'])->middleware('web')->name('query-tabs.show');

    withoutVite();

    get('/query-tabs?tabs=security')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.defaultValue', 'profile')
            ->where('lattice.schema.0.props.activeValue', 'security')
        );
});

test('confirmed active tabs redirect to password confirmation when the password is not confirmed', function (): void {
    Route::get('confirmed-tabs', [WorkbenchConfirmedTabsPage::class, 'render'])->middleware('web')->name('confirmed-tabs.show');
    config(['session.driver' => 'array']);

    get('/confirmed-tabs?tabs=security')
        ->assertRedirect('/user/confirm-password');

    expect(session('url.intended'))->toContain('/confirmed-tabs?tabs=security');
});

test('confirmed active tabs serialize their children after password confirmation', function (): void {
    Route::get('confirmed-tabs', [WorkbenchConfirmedTabsPage::class, 'render'])->middleware('web')->name('confirmed-tabs.show');

    withoutVite();
    config(['session.driver' => 'array']);

    withSession(['auth.password_confirmed_at' => time()]);

    get('/confirmed-tabs?tabs=security')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.activeValue', 'security')
            ->where('lattice.schema.0.schema.1.schema.0.props.text', 'Security form')
        );
});

test('the workbench home route uses a workbench-owned page directly', function (): void {
    expect(Route::getRoutes()->getByName('home')?->getActionName())->toBe(HomePage::class.'@render');
});

test('the workbench tables route uses lazy pagination tab tables', function (): void {
    expect(Route::getRoutes()->getByName('tables.pagination')?->getActionName())->toBe(PaginationPage::class.'@render');
});

test('pages use laravel controller resolution for constructor dependencies render dependencies and route arguments', function (): void {
    $user = UserFactory::new()->create([
        'name' => 'Route Bound User',
    ]);

    Route::get('page-injection/{user}/{label}', [WorkbenchInjectedPage::class, 'render'])
        ->middleware('web')
        ->name('page-injection.show');

    withoutVite();

    get("/page-injection/{$user->getKey()}/details")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.text', 'Injected Route Bound User details details')
        );
});

test('pages can authorize requests before rendering', function (): void {
    Route::get('authorized-page', [WorkbenchAuthorizedPage::class, 'render'])
        ->middleware('web')
        ->name('authorized-page.show');

    withoutVite();

    get('/authorized-page')
        ->assertForbidden();

    get('/authorized-page?allow=yes')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.text', 'Authorized page')
        );
});

test('workbench pages serialize package component trees for inertia', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    $response = get('/')->assertOk();

    // Layout chrome — addressed by type/key, resilient to structural reordering.
    $this->assertLatticeLayout($response)
        ->assertRendered('menu-item:home')
        ->component('menu-item', 'forms', fn ($menu) => $menu->assertProp('label', 'Forms'))
        ->component('menu-item', 'fields', fn ($menu) => $menu->assertProp('label', 'Fields'))
        ->component('menu-item', 'field-builder', fn ($menu) => $menu
            ->assertProps(['label' => 'Builder', 'href' => '/form/fields/builder']))
        ->component('topbar', tap: fn ($topbar) => $topbar->assertProp('sticky', true))
        ->assertRendered('dropdown:locale-switcher')
        ->assertRendered('action:locale-en')
        ->component('menu-item', 'settings', fn ($menu) => $menu->assertProp('icon', 'settings'))
        ->assertRendered('menu-item:log-out')
        ->assertRendered('breadcrumbs')
        ->assertRendered('outlet');

    // Page content — addressed by type/key/id, resilient to structural reordering.
    $this->assertLatticePage($response)
        ->component('stack', 'workbench-hero', fn ($hero) => $hero
            ->component('badge', tap: fn ($badge) => $badge->assertProp('label', 'Lattice Package'))
            ->component(Heading::class, tap: fn ($heading) => $heading->assertProp('text', 'Workbench page')))
        ->component('card', tap: fn ($card) => $card->assertProp('title', 'Components'))
        ->component('grid', 'workbench-charts', fn ($charts) => $charts
            ->assertProp('columns', 3)
            ->component(Fragment::class, 'workbench.revenue-trend-chart', fn ($chart) => $chart
                ->assertProps(['lazy' => true, 'size' => 'lg']))
            ->component(Fragment::class, 'workbench.sales-mix-chart', fn ($chart) => $chart
                ->assertProps(['lazy' => true, 'size' => 'lg']))
            ->component(Fragment::class, 'workbench.order-volume-chart', fn ($chart) => $chart
                ->assertProps(['lazy' => true, 'size' => 'lg'])))
        ->component('table', 'workbench.users', fn ($table) => $table
            ->assertProps(['resizableColumns' => true, 'resizeIndicator' => true]));

    $response->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->component('lattice/page')
        ->where('lattice.title', 'Lattice Workbench')
        ->where('lattice.layout.key', 'app')
        ->where('lattice.container', 'default')
        ->where('lattice.schema.0.key', 'workbench-page')
        ->where('lattice.schema.0.schema.2.props.text', 'Dashboard charts')
        ->etc());
});

test('workbench tables page serializes lazy tables for each pagination type', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    $response = get('/tables/pagination')->assertOk();

    // Tables addressed by id — resilient to tab/stack reordering.
    $this->assertLatticePage($response)
        ->component('table', 'workbench.users.none', fn ($table) => $table->assertProps([
            'lazy' => true,
            'resizableColumns' => true,
            'resizeIndicator' => true,
            'data' => [],
            'pagination.mode' => 'none',
        ]))
        ->component('table', 'workbench.users.simple', fn ($table) => $table->assertProps([
            'resizableColumns' => true,
            'resizeIndicator' => true,
            'pagination.mode' => 'simple',
        ]))
        ->component('table', 'workbench.users.table', fn ($table) => $table->assertProps([
            'resizableColumns' => true,
            'resizeIndicator' => true,
            'pagination.mode' => 'table',
        ]))
        ->component('table', 'workbench.users.infinite', fn ($table) => $table->assertProps([
            'resizableColumns' => true,
            'resizeIndicator' => true,
            'pagination.mode' => 'infinite',
        ]));

    $response->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->component('lattice/page')
        ->where('lattice.title', 'Pagination')
        ->where('lattice.schema.0.type', 'stack')
        ->where('lattice.schema.0.key', 'pagination-page')
        ->where('lattice.schema.0.schema.2.type', 'tabs')
        ->where('lattice.schema.0.schema.2.props.defaultValue', 'none')
        ->where('lattice.schema.0.schema.2.schema.0.props.value', 'none')
        ->where('lattice.schema.0.schema.2.schema.1.props.value', 'simple')
        ->where('lattice.schema.0.schema.2.schema.2.props.value', 'table')
        ->where('lattice.schema.0.schema.2.schema.3.props.value', 'infinite')
        ->etc());
});

test('a page can be returned directly and renders through the responsable contract', function (): void {
    Route::get('responsable-page', fn (): Page => new WorkbenchTabsPage)
        ->middleware('web')
        ->name('responsable-page.show');

    withoutVite();

    get('/responsable-page')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.defaultValue', 'profile')
        );
});

test('directly returned pages resolve route arguments and bound models in render', function (): void {
    $user = UserFactory::new()->create([
        'name' => 'Route Bound User',
    ]);

    Route::get('responsable-injection/{user}/{label}', fn (User $user): Page => app(WorkbenchInjectedPage::class))
        ->middleware('web')
        ->name('responsable-injection.show');

    withoutVite();

    get("/responsable-injection/{$user->getKey()}/details")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.text', 'Injected Route Bound User details details')
        );
});

test('directly returned pages resolve render dependencies through the container, including form requests', function (): void {
    Route::get('responsable-form-request', fn (): Page => new WorkbenchFormRequestPage)
        ->middleware('web')
        ->name('responsable-form-request.show');

    withoutVite();

    get('/responsable-form-request?label=Injected')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.text', 'Injected via form request')
        );

    // The form request is resolved and validated on the responsable path too,
    // so a missing required field fails validation rather than rendering.
    get('/responsable-form-request')
        ->assertFound();
});

final class WorkbenchTabsPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(
            Tabs::make('settings-tabs')
                ->defaultValue('profile')
                ->schema([
                    Tab::make('profile', 'Profile')->schema([
                        Text::make('Profile form'),
                    ]),
                    Tab::make('security', 'Security')->schema([
                        Text::make('Security form'),
                    ]),
                ]),
        );
    }
}

final class WorkbenchConfirmedTabsPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(
            Tabs::make('settings-tabs')
                ->defaultValue('profile')
                ->schema([
                    Tab::make('profile', 'Profile')->schema([
                        Text::make('Profile form'),
                    ]),
                    Tab::make('security', 'Security')
                        ->confirm()
                        ->schema([
                            Text::make('Security form'),
                        ]),
                ]),
        );
    }
}

final class WorkbenchInjectedPage extends Page
{
    public function __construct(private readonly WorkbenchPageDependency $dependency) {}

    public function render(PageSchema $schema, Request $request, User $user, string $label): PageSchema
    {
        return $schema->component(Text::make(sprintf(
            '%s %s %s %s',
            $this->dependency->label(),
            (string) $user->getAttribute('name'),
            $label,
            $request->route('label'),
        )));
    }
}

final class WorkbenchPageDependency
{
    public function label(): string
    {
        return 'Injected';
    }
}

final class WorkbenchPageFormRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return ['label' => ['required', 'string']];
    }
}

final class WorkbenchFormRequestPage extends Page
{
    public function render(PageSchema $schema, WorkbenchPageFormRequest $request): PageSchema
    {
        return $schema->component(Text::make($request->string('label').' via form request'));
    }
}

final class WorkbenchAuthorizedPage extends Page
{
    #[Override]
    public function authorize(Request $request): bool
    {
        return $request->query('allow') === 'yes';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Authorized page'));
    }
}
