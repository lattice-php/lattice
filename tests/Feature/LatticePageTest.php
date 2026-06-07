<?php

declare(strict_types=1);

use Bambamboole\Lattice\Actions\ActionDefinition;
use Bambamboole\Lattice\Actions\ActionResult;
use Bambamboole\Lattice\Actions\Effect;
use Bambamboole\Lattice\Attributes\Action;
use Bambamboole\Lattice\Components\Action as ActionComponent;
use Bambamboole\Lattice\Components\Badge;
use Bambamboole\Lattice\Components\Form;
use Bambamboole\Lattice\Components\Forms\Choice;
use Bambamboole\Lattice\Components\Link;
use Bambamboole\Lattice\Components\Stack;
use Bambamboole\Lattice\Components\Tab;
use Bambamboole\Lattice\Components\Table;
use Bambamboole\Lattice\Components\Tabs;
use Bambamboole\Lattice\Components\Text;
use Bambamboole\Lattice\Enums\Align;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Enums\Width;
use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Lattice;
use Bambamboole\Lattice\Page;
use Bambamboole\Lattice\PageSchema;
use Bambamboole\Lattice\Tables\Columns\StackColumn;
use Bambamboole\Lattice\Tables\Columns\TextColumn;
use Bambamboole\Lattice\Tables\EloquentTableDefinition;
use Bambamboole\Lattice\Tables\PaginationType;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableQuery;
use Bambamboole\Lattice\Tables\TableResult;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Orchestra\Testbench\Factories\UserFactory;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Pages\WorkbenchHomePage;
use Workbench\App\Pages\WorkbenchTablesPage;
use Workbench\App\Seeders\WorkbenchUserSeeder;
use Workbench\App\Tables\UsersTable as WorkbenchAppUsersTable;

use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\patch;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutVite;
use function Pest\Laravel\withSession;

test('lattice component factories stay open for extension', function () {
    $badgeClass = (new class extends Badge {})::class;
    $badge = $badgeClass::make('Extended badge', 'extended-badge');

    expect($badge)->toBeInstanceOf($badgeClass)
        ->and((new ReflectionClass(Badge::class))->isFinal())->toBeFalse();
});

test('interactive components keep their serialized ids', function () {
    expect(Form::make('demo-form')->toArray())
        ->toMatchArray([
            'type' => 'form',
            'id' => 'demo-form',
        ])
        ->and(Table::make('demo-table')->toArray())
        ->toMatchArray([
            'type' => 'table',
            'id' => 'demo-table',
        ]);
});

test('forms serialize schema children like pages', function () {
    expect(Form::make('profile-form')->schema([
        Text::make('Profile details'),
    ])->toArray())
        ->toMatchArray([
            'type' => 'form',
            'id' => 'profile-form',
            'children' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Profile details',
                    ],
                ],
            ],
        ]);
});

test('forms can disable their default submit button', function () {
    expect(Form::make('profile-form')->withoutSubmitButton()->toArray())
        ->toMatchArray([
            'type' => 'form',
            'id' => 'profile-form',
            'props' => [
                'submitButton' => false,
            ],
        ]);
});

test('components can opt out of rendering with when', function () {
    $page = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->components([
                Text::make('Visible root'),
                Text::make('Hidden root')->when(false),
                Stack::make('nested')->children([
                    Text::make('Visible child'),
                    Text::make('Hidden child')->when(false),
                ]),
            ]);
        }
    };

    $pageData = $page->toArray($page->render(PageSchema::make()));

    expect($pageData['components'])
        ->toHaveCount(2)
        ->and($pageData['components'][0]['props']['text'])->toBe('Visible root')
        ->and($pageData['components'][1]['children'])->toHaveCount(1)
        ->and($pageData['components'][1]['children'][0]['props']['text'])->toBe('Visible child');
});

test('form choices serialize options value and change events', function () {
    expect(Choice::make('appearance', 'Appearance')
        ->value('system')
        ->event('lattice:appearance-change')
        ->options([
            Choice::option('Light', 'light'),
            Choice::option('Dark', 'dark'),
            Choice::option('System', 'system'),
        ])
        ->toArray())
        ->toMatchArray([
            'type' => 'form.choice',
            'props' => [
                'label' => 'Appearance',
                'name' => 'appearance',
                'value' => 'system',
                'event' => 'lattice:appearance-change',
                'options' => [
                    [
                        'label' => 'Light',
                        'value' => 'light',
                    ],
                    [
                        'label' => 'Dark',
                        'value' => 'dark',
                    ],
                    [
                        'label' => 'System',
                        'value' => 'system',
                    ],
                ],
            ],
        ]);
});

test('registered forms serialize their configured endpoint and isolated error bag', function () {
    config(['lattice.forms.endpoint' => 'custom/forms/{form}']);

    Lattice::forms([WorkbenchProfileForm::class]);

    expect(Form::use(WorkbenchProfileForm::class)->toArray())
        ->toMatchArray([
            'type' => 'form',
            'id' => 'settings.profile',
            'props' => [
                'action' => '/custom/forms/settings.profile',
                'errorBag' => 'settings_profile',
                'method' => 'patch',
                'submitButton' => false,
            ],
            'children' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Profile details',
                    ],
                ],
            ],
        ]);
});

test('registered forms can be submitted through the package endpoint', function () {
    Lattice::forms([WorkbenchProfileForm::class]);

    patch('/lattice/forms/settings.profile', ['name' => 'Taylor'])
        ->assertRedirect('/submitted');

    expect(session('handled-form'))->toBe('Taylor');
});

test('registered tables serialize their configured endpoint columns state and initial data', function () {
    config(['lattice.tables.endpoint' => 'custom/tables/{table}']);

    Lattice::tables([WorkbenchUsersTable::class]);

    expect(Table::use(WorkbenchUsersTable::class)->toArray())
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.users',
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                        'sortable' => true,
                        'filter' => [
                            'enabled' => true,
                            'type' => 'partial',
                        ],
                    ],
                    [
                        'key' => 'status',
                        'label' => 'Status',
                        'type' => 'text',
                        'filter' => [
                            'enabled' => true,
                            'type' => 'exact',
                        ],
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email',
                        'type' => 'text',
                        'sortable' => true,
                    ],
                ],
                'data' => [
                    [
                        'name' => 'Taylor',
                        'status' => null,
                        'sorts' => [],
                    ],
                ],
                'state' => [
                    'filters' => [],
                    'sorts' => [],
                    'page' => 1,
                    'perPage' => 25,
                ],
                'pagination' => [],
            ],
        ]);
});

test('registered tables can serialize lazily without running their query', function () {
    config(['lattice.tables.endpoint' => 'custom/tables/{table}']);

    Lattice::tables([WorkbenchLazyUsersTable::class]);

    expect(Table::lazy(WorkbenchLazyUsersTable::class)->toArray())
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.lazy-users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.lazy-users',
                'lazy' => true,
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                    ],
                ],
                'data' => [],
                'state' => [
                    'filters' => [],
                    'sorts' => [],
                    'page' => 1,
                    'perPage' => 25,
                ],
                'pagination' => [
                    'mode' => 'table',
                ],
            ],
        ]);
});

test('registered tables serialize grid layout stack columns and row actions', function () {
    Lattice::actions([WorkbenchPingAction::class]);
    Lattice::tables([WorkbenchStackedUsersTable::class]);

    $table = Table::use(WorkbenchStackedUsersTable::class)->toArray();

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.stacked-users',
        ])
        ->and($table['props']['layout'])->toBe('grid')
        ->and($table['props']['columns'])->toMatchArray([
            [
                'key' => 'identity',
                'label' => 'Identity',
                'type' => 'stack',
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                        'sortable' => true,
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email',
                        'type' => 'text',
                    ],
                ],
            ],
            [
                'key' => 'status',
                'label' => 'Status',
                'type' => 'text',
            ],
        ])
        ->and($table['props']['rows'][0]['key'])->toBe('1')
        ->and($table['props']['rows'][0]['actions'][0])->toMatchArray([
            'type' => 'action',
            'id' => 'workbench.ping',
        ])
        ->and($table['props']['rows'][0]['actions'][0]['props'])
        ->toMatchArray([
            'label' => 'Ping',
            'method' => 'post',
        ]);
});

test('registered tables parse spatie style filters sorts and pagination through the endpoint', function () {
    Lattice::tables([WorkbenchUsersTable::class]);

    getJson('/lattice/tables/workbench.users?filter[status]=active&filter[name]=tay&sort=-name,email&page=2&per_page=50')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Taylor')
        ->assertJsonPath('data.0.status', 'active')
        ->assertJsonPath('data.0.sorts.0.key', 'name')
        ->assertJsonPath('data.0.sorts.0.direction', 'desc')
        ->assertJsonPath('data.0.sorts.1.key', 'email')
        ->assertJsonPath('data.0.sorts.1.direction', 'asc')
        ->assertJsonPath('state.filters.status', 'active')
        ->assertJsonPath('state.filters.name', 'tay')
        ->assertJsonPath('state.page', 2)
        ->assertJsonPath('state.perPage', 50);
});

test('registered tables reject filters and sorts that are not allowed by columns', function () {
    Lattice::tables([WorkbenchUsersTable::class]);

    getJson('/lattice/tables/workbench.users?filter[password]=secret')
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Filter [password] is not allowed for table [workbench.users].');

    getJson('/lattice/tables/workbench.users?sort=password')
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Sort [password] is not allowed for table [workbench.users].');
});

test('text columns serialize display modifiers', function () {
    expect(TextColumn::make('published_at')
        ->label('Published')
        ->date('Y-m-d')
        ->copyable()
        ->link('/posts/{id}')
        ->toArray())
        ->toMatchArray([
            'key' => 'published_at',
            'label' => 'Published',
            'type' => 'text',
            'date' => [
                'format' => 'Y-m-d',
            ],
            'copyable' => true,
            'link' => [
                'href' => '/posts/{id}',
                'external' => false,
            ],
        ]);
});

test('workbench users table exposes timestamp columns for each row', function () {
    Lattice::tables([WorkbenchAppUsersTable::class]);

    $columns = Table::use(WorkbenchAppUsersTable::class)->toArray()['props']['columns'];

    expect(array_column($columns, 'key'))->toBe(['name', 'email', 'created_at', 'updated_at'])
        ->and($columns[2])->toMatchArray([
            'key' => 'created_at',
            'label' => 'Created at',
            'sortable' => true,
            'date' => [
                'format' => 'Y-m-d H:i:s',
            ],
        ])
        ->and($columns[3])->toMatchArray([
            'key' => 'updated_at',
            'label' => 'Updated at',
            'sortable' => true,
            'date' => [
                'format' => 'Y-m-d H:i:s',
            ],
        ]);
});

test('eloquent tables can use infinite pagination metadata', function () {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }

    Lattice::tables([WorkbenchInfiniteUsersTable::class]);

    $table = Table::use(WorkbenchInfiniteUsersTable::class)->toArray();

    expect($table['props']['pagination'])
        ->toMatchArray([
            'mode' => 'infinite',
            'currentPage' => 1,
            'hasMore' => true,
            'nextPage' => 2,
            'perPage' => 2,
            'from' => 1,
            'to' => 2,
        ]);

    getJson('/lattice/tables/workbench.infinite-users?per_page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.currentPage', 1)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2)
        ->assertJsonPath('state.page', 1)
        ->assertJsonPath('state.perPage', 2);

    getJson('/lattice/tables/workbench.infinite-users?per_page=2&page=2')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.currentPage', 2)
        ->assertJsonPath('pagination.hasMore', false)
        ->assertJsonPath('pagination.nextPage', null);
});

test('eloquent tables use table pagination with totals by default', function () {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }

    Lattice::tables([WorkbenchDefaultUsersTable::class]);

    getJson('/lattice/tables/workbench.default-users?per_page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'table')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.lastPage', 2)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2);
});

test('eloquent tables can use simple pagination without totals', function () {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }

    Lattice::tables([WorkbenchSimpleUsersTable::class]);

    getJson('/lattice/tables/workbench.simple-users?per_page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'simple')
        ->assertJsonMissingPath('pagination.total')
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2);
});

test('eloquent tables can disable pagination for small datasets', function () {
    User::query()->delete();

    foreach (['Ada Lovelace', 'Grace Hopper', 'Maya Chen'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => str($name)->slug()->append('@example.com')->toString(),
        ]);
    }

    Lattice::tables([WorkbenchSmallUsersTable::class]);

    getJson('/lattice/tables/workbench.small-users?per_page=1')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('pagination.mode', 'none')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.hasMore', false);
});

test('registered actions serialize their configured endpoint method label and effects', function () {
    config(['lattice.actions.endpoint' => 'custom/actions/{action}']);

    Lattice::actions([WorkbenchPingAction::class]);

    expect(ActionComponent::use(WorkbenchPingAction::class)->toArray())
        ->toMatchArray([
            'type' => 'action',
            'id' => 'workbench.ping',
            'props' => [
                'endpoint' => '/custom/actions/workbench.ping',
                'label' => 'Ping',
                'method' => 'post',
                'variant' => 'secondary',
                'effects' => [
                    [
                        'type' => 'toast',
                        'message' => 'Ready.',
                    ],
                    [
                        'type' => 'reloadComponent',
                        'component' => 'workbench.users',
                    ],
                ],
            ],
        ]);
});

test('registered actions can be handled through the package endpoint', function () {
    Lattice::actions([WorkbenchPingAction::class]);

    postJson('/lattice/actions/workbench.ping', ['name' => 'Taylor'])
        ->assertOk()
        ->assertJsonPath('ok', true)
        ->assertJsonPath('data.handled', 'Taylor')
        ->assertJsonPath('effects.0.type', 'toast')
        ->assertJsonPath('effects.0.message', 'Action handled.')
        ->assertJsonPath('effects.1.type', 'reloadComponent')
        ->assertJsonPath('effects.1.component', 'workbench.users');
});

test('actions can serialize confirmation modal configuration', function () {
    expect(ActionComponent::make('delete-account')
        ->label('Delete account')
        ->method('delete')
        ->variant('destructive')
        ->confirm(
            title: 'Delete account?',
            description: 'This cannot be undone.',
            confirmLabel: 'Delete account',
            cancelLabel: 'Keep account',
        )
        ->toArray())
        ->toMatchArray([
            'type' => 'action',
            'id' => 'delete-account',
            'props' => [
                'label' => 'Delete account',
                'method' => 'delete',
                'variant' => 'destructive',
                'confirmation' => [
                    'title' => 'Delete account?',
                    'description' => 'This cannot be undone.',
                    'confirmLabel' => 'Delete account',
                    'cancelLabel' => 'Keep account',
                ],
            ],
        ]);
});

test('links and horizontal stacks serialize as separate composable primitives', function () {
    expect(Stack::make('prompt')->direction('row')->gap(Gap::ExtraSmall)->children([
        Text::make('Need access?'),
        Link::make('Register')->href('/register'),
    ])->toArray())
        ->toMatchArray([
            'type' => 'stack',
            'key' => 'prompt',
            'props' => [
                'direction' => 'row',
                'gap' => 'xs',
            ],
            'children' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Need access?',
                    ],
                ],
                [
                    'type' => 'link',
                    'props' => [
                        'href' => '/register',
                        'label' => 'Register',
                    ],
                ],
            ],
        ]);
});

test('layout enums serialize to their backed string values', function () {
    expect(Stack::make('layout')
        ->align(Align::Center)
        ->gap(Gap::Large)
        ->width(Width::Small)
        ->toArray())
        ->toMatchArray([
            'props' => [
                'align' => 'center',
                'gap' => 'lg',
                'width' => 'sm',
            ],
        ])
        ->and(Text::make('Centered')->align(Align::Center)->toArray()['props']['align'])
        ->toBe('center');
});

test('tabs serialize tab panels as composable children', function () {
    expect(Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->children([
            Tab::make('profile', 'Profile')->children([
                Text::make('Profile form'),
            ]),
            Tab::make('security', 'Security')->children([
                Form::make('password-form'),
            ]),
        ])
        ->toArray())
        ->toMatchArray([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'activeValue' => 'security',
                'defaultValue' => 'security',
                'queryKey' => 'tabs',
            ],
            'children' => [
                [
                    'type' => 'tab',
                    'props' => [
                        'label' => 'Profile',
                        'value' => 'profile',
                    ],
                    'children' => [
                        [
                            'type' => 'text',
                            'props' => [
                                'text' => 'Profile form',
                            ],
                        ],
                    ],
                ],
                [
                    'type' => 'tab',
                    'props' => [
                        'label' => 'Security',
                        'value' => 'security',
                    ],
                    'children' => [
                        [
                            'type' => 'form',
                            'id' => 'password-form',
                        ],
                    ],
                ],
            ],
        ]);
});

test('tabs can customize their query string key', function () {
    expect(Tabs::make('settings-tabs')
        ->queryKey('settings-tab')
        ->toArray())
        ->toMatchArray([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'activeValue' => '',
                'queryKey' => 'settings-tab',
            ],
        ]);
});

test('tabs ignore hidden tab children when resolving their active value', function () {
    $tabs = Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->children([
            Tab::make('profile', 'Profile'),
            Tab::make('security', 'Security')->when(false),
        ])
        ->toArray();

    expect($tabs['props']['activeValue'])->toBe('profile')
        ->and($tabs['children'])->toHaveCount(1)
        ->and($tabs['children'][0]['props']['value'])->toBe('profile');
});

test('tabs hydrate their active value from the request query string', function () {
    Route::latticePage('query-tabs', WorkbenchTabsPage::class)->middleware('web')->name('query-tabs.show');

    withoutVite();

    get('/query-tabs?tabs=security')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.components.0.props.defaultValue', 'profile')
            ->where('lattice.components.0.props.activeValue', 'security')
        );
});

test('confirmed inactive tabs serialize only their tab metadata', function () {
    $tabs = Tabs::make('settings-tabs')
        ->defaultValue('profile')
        ->children([
            Tab::make('profile', 'Profile')->children([
                Text::make('Profile form'),
            ]),
            Tab::make('security', 'Security')
                ->confirm()
                ->children([
                    Text::make('Security form'),
                ]),
        ])
        ->toArray();

    expect($tabs['props']['activeValue'])->toBe('profile')
        ->and($tabs['props']['defaultValue'])->toBe('profile')
        ->and($tabs['props']['queryKey'])->toBe('tabs')
        ->and($tabs['children'][0]['props']['value'])->toBe('profile')
        ->and($tabs['children'][1]['props']['value'])->toBe('security')
        ->and($tabs['children'][1]['props']['confirm'])->toMatchArray([
            'required' => true,
            'redirectUrl' => '/user/confirm-password',
        ])
        ->and($tabs['children'][1])->not->toHaveKey('children');
});

test('confirmed active tabs redirect to password confirmation when the password is not confirmed', function () {
    Route::latticePage('confirmed-tabs', WorkbenchConfirmedTabsPage::class)->middleware('web')->name('confirmed-tabs.show');
    config(['session.driver' => 'array']);

    get('/confirmed-tabs?tabs=security')
        ->assertRedirect('/user/confirm-password');

    expect(session('url.intended'))->toContain('/confirmed-tabs?tabs=security');
});

test('confirmed active tabs serialize their children after password confirmation', function () {
    Route::latticePage('confirmed-tabs', WorkbenchConfirmedTabsPage::class)->middleware('web')->name('confirmed-tabs.show');

    withoutVite();
    config(['session.driver' => 'array']);

    withSession(['auth.password_confirmed_at' => time()]);

    get('/confirmed-tabs?tabs=security')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.components.0.props.activeValue', 'security')
            ->where('lattice.components.0.children.1.children.0.props.text', 'Security form')
        );
});

test('the workbench home route uses a workbench-owned page directly', function () {
    expect(Route::getRoutes()->getByName('home')?->getActionName())->toBe(WorkbenchHomePage::class.'@render');
});

test('the workbench tables route uses lazy pagination tab tables', function () {
    expect(Route::getRoutes()->getByName('tables')?->getActionName())->toBe(WorkbenchTablesPage::class.'@render');
});

test('pages use laravel controller resolution for constructor dependencies render dependencies and route arguments', function () {
    $user = UserFactory::new()->create([
        'name' => 'Route Bound User',
    ]);

    Route::latticePage('page-injection/{user}/{label}', WorkbenchInjectedPage::class)
        ->middleware('web')
        ->name('page-injection.show');

    withoutVite();

    get("/page-injection/{$user->getKey()}/details")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.components.0.props.text', 'Injected Route Bound User details details')
        );
});

test('pages serialize layout and container metadata', function () {
    $defaultPage = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Default page'));
        }
    };

    $configuredPage = new class extends Page
    {
        public function layout(): string
        {
            return 'settings';
        }

        public function container(): string
        {
            return 'default';
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Configured page'));
        }
    };

    expect($defaultPage->toArray($defaultPage->render(PageSchema::make())))
        ->toMatchArray([
            'layout' => 'none',
            'container' => 'centered',
        ])
        ->and($configuredPage->toArray($configuredPage->render(PageSchema::make())))
        ->toMatchArray([
            'layout' => 'settings',
            'container' => 'default',
        ]);
});

test('workbench pages serialize package component trees for inertia', function () {
    withoutVite();

    get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Lattice Workbench')
            ->where('lattice.layout', 'none')
            ->where('lattice.container', 'centered')
            ->where('lattice.components.0.type', 'stack')
            ->where('lattice.components.0.key', 'workbench-page')
            ->where('lattice.components.0.children.0.type', 'stack')
            ->where('lattice.components.0.children.0.key', 'workbench-hero')
            ->where('lattice.components.0.children.0.children.0.type', 'badge')
            ->where('lattice.components.0.children.0.children.0.props.label', 'Lattice Package')
            ->where('lattice.components.0.children.0.children.1.type', 'heading')
            ->where('lattice.components.0.children.0.children.1.props.text', 'Workbench page')
            ->where('lattice.components.0.children.1.type', 'grid')
            ->where('lattice.components.0.children.1.children.0.type', 'card')
            ->where('lattice.components.0.children.1.children.0.props.title', 'Components'));
});

test('workbench tables page serializes lazy tables for each pagination type', function () {
    withoutVite();

    get('/tables')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Lattice Tables')
            ->where('lattice.components.0.type', 'stack')
            ->where('lattice.components.0.key', 'tables-page')
            ->where('lattice.components.0.children.1.type', 'tabs')
            ->where('lattice.components.0.children.1.props.defaultValue', 'none')
            ->where('lattice.components.0.children.1.children.0.props.value', 'none')
            ->where('lattice.components.0.children.1.children.0.children.1.id', 'workbench.users.none')
            ->where('lattice.components.0.children.1.children.0.children.1.props.lazy', true)
            ->where('lattice.components.0.children.1.children.0.children.1.props.data', [])
            ->where('lattice.components.0.children.1.children.0.children.1.props.pagination.mode', 'none')
            ->where('lattice.components.0.children.1.children.1.props.value', 'simple')
            ->where('lattice.components.0.children.1.children.1.children.1.id', 'workbench.users.simple')
            ->where('lattice.components.0.children.1.children.1.children.1.props.pagination.mode', 'simple')
            ->where('lattice.components.0.children.1.children.2.props.value', 'table')
            ->where('lattice.components.0.children.1.children.2.children.1.id', 'workbench.users.table')
            ->where('lattice.components.0.children.1.children.2.children.1.props.pagination.mode', 'table')
            ->where('lattice.components.0.children.1.children.3.props.value', 'infinite')
            ->where('lattice.components.0.children.1.children.3.children.1.id', 'workbench.users.infinite')
            ->where('lattice.components.0.children.1.children.3.children.1.props.pagination.mode', 'infinite'));
});

test('workbench user seeder creates sample table data idempotently', function () {
    app(WorkbenchUserSeeder::class)->run();
    app(WorkbenchUserSeeder::class)->run();

    expect(User::query()->count())->toBe(1000)
        ->and(User::query()->where('email', 'ada@example.com')->value('name'))->toBe('Ada Lovelace')
        ->and(User::query()->where('email', 'workbench-user-994@example.com')->exists())->toBeTrue()
        ->and(User::query()->distinct()->count('created_at'))->toBe(1000)
        ->and(User::query()->distinct()->count('updated_at'))->toBe(1000)
        ->and(User::query()->whereColumn('updated_at', '<', 'created_at')->doesntExist())->toBeTrue();
});

#[Bambamboole\Lattice\Attributes\Form('settings.profile')]
class WorkbenchProfileForm extends FormDefinition
{
    public function definition(Form $form): Form
    {
        return $form
            ->method('patch')
            ->schema([
                Text::make('Profile details'),
            ])
            ->withoutSubmitButton();
    }

    public function handle(Request $request): Response
    {
        $request->session()->put('handled-form', $request->string('name')->toString());

        return redirect('/submitted');
    }
}

#[Bambamboole\Lattice\Attributes\Table('workbench.users')]
class WorkbenchUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')
                ->label('Name')
                ->sortable()
                ->filterable(),
            TextColumn::make('status')
                ->label('Status')
                ->filterableExact(),
            TextColumn::make('email')
                ->label('Email')
                ->sortable(),
        ];
    }

    public function query(TableQuery $query): TableResult
    {
        return TableResult::make([
            [
                'name' => 'Taylor',
                'status' => $query->filter('status'),
                'sorts' => array_map(
                    fn ($sort): array => [
                        'key' => $sort->key,
                        'direction' => $sort->direction,
                    ],
                    $query->sorts(),
                ),
            ],
        ]);
    }
}

#[Bambamboole\Lattice\Attributes\Table('workbench.lazy-users')]
class WorkbenchLazyUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name'),
        ];
    }

    public function query(TableQuery $query): TableResult
    {
        throw new RuntimeException('Lazy table query should not run during serialization.');
    }
}

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[Bambamboole\Lattice\Attributes\Table('workbench.infinite-users')]
class WorkbenchInfiniteUsersTable extends EloquentTableDefinition
{
    public function pagination(): PaginationType
    {
        return PaginationType::Infinite;
    }

    public function perPage(): int
    {
        return 2;
    }

    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
            TextColumn::make('email')->label('Email'),
        ];
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return User::query()->select(['id', 'name', 'email'])->orderBy('id');
    }
}

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[Bambamboole\Lattice\Attributes\Table('workbench.default-users')]
class WorkbenchDefaultUsersTable extends EloquentTableDefinition
{
    public function perPage(): int
    {
        return 2;
    }

    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
        ];
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return User::query()->select(['id', 'name'])->orderBy('id');
    }
}

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[Bambamboole\Lattice\Attributes\Table('workbench.simple-users')]
class WorkbenchSimpleUsersTable extends EloquentTableDefinition
{
    public function pagination(): PaginationType
    {
        return PaginationType::Simple;
    }

    public function perPage(): int
    {
        return 2;
    }

    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
        ];
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return User::query()->select(['id', 'name'])->orderBy('id');
    }
}

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[Bambamboole\Lattice\Attributes\Table('workbench.small-users')]
class WorkbenchSmallUsersTable extends EloquentTableDefinition
{
    public function pagination(): PaginationType
    {
        return PaginationType::None;
    }

    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable(),
        ];
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return User::query()->select(['id', 'name'])->orderBy('id');
    }
}

#[Bambamboole\Lattice\Attributes\Table('workbench.stacked-users')]
class WorkbenchStackedUsersTable extends TableDefinition
{
    public function layout(): string
    {
        return 'grid';
    }

    public function pagination(): PaginationType
    {
        return PaginationType::None;
    }

    public function columns(): array
    {
        return [
            StackColumn::make('identity')
                ->label('Identity')
                ->columns([
                    TextColumn::make('name')->label('Name')->sortable(),
                    TextColumn::make('email')->label('Email'),
                ]),
            TextColumn::make('status')->label('Status'),
        ];
    }

    public function actions(array $row): array
    {
        return [
            ActionComponent::use(WorkbenchPingAction::class),
        ];
    }

    public function query(TableQuery $query): TableResult
    {
        return TableResult::make([
            [
                'id' => 1,
                'name' => 'Taylor',
                'email' => 'taylor@example.com',
                'status' => 'Active',
            ],
        ]);
    }
}

final class WorkbenchTabsPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(
            Tabs::make('settings-tabs')
                ->defaultValue('profile')
                ->children([
                    Tab::make('profile', 'Profile')->children([
                        Text::make('Profile form'),
                    ]),
                    Tab::make('security', 'Security')->children([
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
                ->children([
                    Tab::make('profile', 'Profile')->children([
                        Text::make('Profile form'),
                    ]),
                    Tab::make('security', 'Security')
                        ->confirm()
                        ->children([
                            Text::make('Security form'),
                        ]),
                ]),
        );
    }
}

final class WorkbenchInjectedPage extends Page
{
    public function __construct(private WorkbenchPageDependency $dependency) {}

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

#[Action('workbench.ping')]
class WorkbenchPingAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action
            ->label('Ping')
            ->method('post')
            ->variant('secondary')
            ->effects([
                Effect::toast('Ready.'),
                Effect::reloadComponent('workbench.users'),
            ]);
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success([
            'handled' => $request->string('name')->toString(),
        ])
            ->toast('Action handled.')
            ->reloadComponent('workbench.users');
    }
}
