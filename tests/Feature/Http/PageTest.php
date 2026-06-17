<?php
declare(strict_types=1);

use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;
use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\TablesPage;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;
use function Pest\Laravel\withSession;

test('tabs hydrate their active value from the request query string', function () {
    Route::get('query-tabs', [WorkbenchTabsPage::class, 'render'])->middleware('web')->name('query-tabs.show');

    withoutVite();

    get('/query-tabs?tabs=security')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.defaultValue', 'profile')
            ->where('lattice.schema.0.props.activeValue', 'security')
        );
});

test('confirmed active tabs redirect to password confirmation when the password is not confirmed', function () {
    Route::get('confirmed-tabs', [WorkbenchConfirmedTabsPage::class, 'render'])->middleware('web')->name('confirmed-tabs.show');
    config(['session.driver' => 'array']);

    get('/confirmed-tabs?tabs=security')
        ->assertRedirect('/user/confirm-password');

    expect(session('url.intended'))->toContain('/confirmed-tabs?tabs=security');
});

test('confirmed active tabs serialize their children after password confirmation', function () {
    Route::get('confirmed-tabs', [WorkbenchConfirmedTabsPage::class, 'render'])->middleware('web')->name('confirmed-tabs.show');

    withoutVite();
    config(['session.driver' => 'array']);

    withSession(['auth.password_confirmed_at' => time()]);

    get('/confirmed-tabs?tabs=security')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.activeValue', 'security')
            ->where('lattice.schema.0.schema.1.schema.0.props.text', 'Security form')
        );
});

test('the workbench home route uses a workbench-owned page directly', function () {
    expect(Route::getRoutes()->getByName('home')?->getActionName())->toBe(HomePage::class.'@render');
});

test('the workbench tables route uses lazy pagination tab tables', function () {
    expect(Route::getRoutes()->getByName('tables')?->getActionName())->toBe(TablesPage::class.'@render');
});

test('pages use laravel controller resolution for constructor dependencies render dependencies and route arguments', function () {
    $user = UserFactory::new()->create([
        'name' => 'Route Bound User',
    ]);

    Route::get('page-injection/{user}/{label}', [WorkbenchInjectedPage::class, 'render'])
        ->middleware('web')
        ->name('page-injection.show');

    withoutVite();

    get("/page-injection/{$user->getKey()}/details")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.text', 'Injected Route Bound User details details')
        );
});

test('pages can authorize requests before rendering', function () {
    Route::get('authorized-page', [WorkbenchAuthorizedPage::class, 'render'])
        ->middleware('web')
        ->name('authorized-page.show');

    withoutVite();

    get('/authorized-page')
        ->assertForbidden();

    get('/authorized-page?allow=yes')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.schema.0.props.text', 'Authorized page')
        );
});

test('workbench pages serialize package component trees for inertia', function () {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Lattice Workbench')
            ->where('lattice.layout.key', 'app')
            ->where('lattice.layout.schema.0.type', 'stack')
            ->where('lattice.layout.schema.0.schema.0.schema.1.schema.1.props.label', 'Forms')
            ->where('lattice.layout.schema.0.schema.0.schema.1.schema.1.schema.2.props.label', 'Builder Table Demo')
            ->where('lattice.layout.schema.0.schema.0.schema.1.schema.1.schema.2.props.href', '/builder-table')
            ->where('lattice.layout.schema.0.schema.1.schema.0.type', 'topbar')
            ->where('lattice.layout.schema.0.schema.1.schema.0.props.sticky', true)
            ->where('lattice.layout.schema.0.schema.1.schema.0.schema.0.schema.2.schema.0.type', 'menu-item')
            ->where('lattice.layout.schema.0.schema.1.schema.0.schema.0.schema.2.schema.0.props.label', 'Log out')
            ->where('lattice.layout.schema.0.schema.1.schema.1.type', 'breadcrumbs')
            ->where('lattice.layout.schema.0.schema.1.schema.2.type', 'outlet')
            ->where('lattice.layout.schema.0.schema.1.schema.0.schema.0.schema.0.type', 'dropdown')
            ->where('lattice.layout.schema.0.schema.1.schema.0.schema.0.schema.0.key', 'locale-switcher')
            ->where('lattice.layout.schema.0.schema.1.schema.0.schema.0.schema.0.schema.0.key', 'locale-en')
            ->where('lattice.layout.schema.0.schema.1.schema.0.schema.0.schema.0.schema.1.key', 'locale-de')
            ->where('lattice.layout.schema.0.schema.1.schema.0.schema.0.schema.1.schema.0.type', 'menu-item')
            ->where('lattice.layout.schema.0.schema.1.schema.0.schema.0.schema.1.schema.0.props.iconOnly', true)
            ->where('lattice.container', 'default')
            ->where('lattice.schema.0.type', 'stack')
            ->where('lattice.schema.0.key', 'workbench-page')
            ->where('lattice.schema.0.schema.0.type', 'stack')
            ->where('lattice.schema.0.schema.0.key', 'workbench-hero')
            ->where('lattice.schema.0.schema.0.schema.0.type', 'badge')
            ->where('lattice.schema.0.schema.0.schema.0.props.label', 'Lattice Package')
            ->where('lattice.schema.0.schema.0.schema.1.type', 'heading')
            ->where('lattice.schema.0.schema.0.schema.1.props.text', 'Workbench page')
            ->where('lattice.schema.0.schema.1.type', 'grid')
            ->where('lattice.schema.0.schema.1.schema.0.type', 'card')
            ->where('lattice.schema.0.schema.1.schema.0.props.title', 'Components')
            ->where('lattice.schema.0.schema.2.type', 'heading')
            ->where('lattice.schema.0.schema.2.props.text', 'Dashboard charts')
            ->where('lattice.schema.0.schema.3.type', 'grid')
            ->where('lattice.schema.0.schema.3.props.columns', 3)
            ->where('lattice.schema.0.schema.3.schema.0.id', 'workbench.revenue-trend-chart')
            ->where('lattice.schema.0.schema.3.schema.0.props.lazy', true)
            ->where('lattice.schema.0.schema.3.schema.0.props.size', 'lg')
            ->where('lattice.schema.0.schema.3.schema.1.id', 'workbench.sales-mix-chart')
            ->where('lattice.schema.0.schema.3.schema.1.props.lazy', true)
            ->where('lattice.schema.0.schema.3.schema.1.props.size', 'lg')
            ->where('lattice.schema.0.schema.3.schema.2.id', 'workbench.order-volume-chart')
            ->where('lattice.schema.0.schema.3.schema.2.props.lazy', true)
            ->where('lattice.schema.0.schema.3.schema.2.props.size', 'lg')
            ->where('lattice.schema.0.schema.7.id', 'workbench.users')
            ->where('lattice.schema.0.schema.7.props.resizableColumns', true)
            ->where('lattice.schema.0.schema.7.props.resizeIndicator', true));
});

test('workbench tables page serializes lazy tables for each pagination type', function () {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/tables')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Lattice Tables')
            ->where('lattice.schema.0.type', 'stack')
            ->where('lattice.schema.0.key', 'tables-page')
            ->where('lattice.schema.0.schema.1.type', 'tabs')
            ->where('lattice.schema.0.schema.1.props.defaultValue', 'none')
            ->where('lattice.schema.0.schema.1.schema.0.props.value', 'none')
            ->where('lattice.schema.0.schema.1.schema.0.schema.1.id', 'workbench.users.none')
            ->where('lattice.schema.0.schema.1.schema.0.schema.1.props.lazy', true)
            ->where('lattice.schema.0.schema.1.schema.0.schema.1.props.resizableColumns', true)
            ->where('lattice.schema.0.schema.1.schema.0.schema.1.props.resizeIndicator', true)
            ->where('lattice.schema.0.schema.1.schema.0.schema.1.props.data', [])
            ->where('lattice.schema.0.schema.1.schema.0.schema.1.props.pagination.mode', 'none')
            ->where('lattice.schema.0.schema.1.schema.1.props.value', 'simple')
            ->where('lattice.schema.0.schema.1.schema.1.schema.1.id', 'workbench.users.simple')
            ->where('lattice.schema.0.schema.1.schema.1.schema.1.props.resizableColumns', true)
            ->where('lattice.schema.0.schema.1.schema.1.schema.1.props.resizeIndicator', true)
            ->where('lattice.schema.0.schema.1.schema.1.schema.1.props.pagination.mode', 'simple')
            ->where('lattice.schema.0.schema.1.schema.2.props.value', 'table')
            ->where('lattice.schema.0.schema.1.schema.2.schema.1.id', 'workbench.users.table')
            ->where('lattice.schema.0.schema.1.schema.2.schema.1.props.resizableColumns', true)
            ->where('lattice.schema.0.schema.1.schema.2.schema.1.props.resizeIndicator', true)
            ->where('lattice.schema.0.schema.1.schema.2.schema.1.props.pagination.mode', 'table')
            ->where('lattice.schema.0.schema.1.schema.3.props.value', 'infinite')
            ->where('lattice.schema.0.schema.1.schema.3.schema.1.id', 'workbench.users.infinite')
            ->where('lattice.schema.0.schema.1.schema.3.schema.1.props.resizableColumns', true)
            ->where('lattice.schema.0.schema.1.schema.3.schema.1.props.resizeIndicator', true)
            ->where('lattice.schema.0.schema.1.schema.3.schema.1.props.pagination.mode', 'infinite'));
});

// ---------------------------------------------------------------------------
// Inline fixture classes required only by this file
// ---------------------------------------------------------------------------

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
