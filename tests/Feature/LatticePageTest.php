<?php

declare(strict_types=1);

use Bambamboole\Lattice\Actions\ActionDefinition;
use Bambamboole\Lattice\Actions\ActionResult;
use Bambamboole\Lattice\Actions\Effect;
use Bambamboole\Lattice\Attributes\Action;
use Bambamboole\Lattice\Attributes\Fragment;
use Bambamboole\Lattice\Components\Core\Action as ActionComponent;
use Bambamboole\Lattice\Components\Core\ActionGroup;
use Bambamboole\Lattice\Components\Core\Badge;
use Bambamboole\Lattice\Components\Core\Fragment as FragmentComponent;
use Bambamboole\Lattice\Components\Core\Link;
use Bambamboole\Lattice\Components\Core\Modal;
use Bambamboole\Lattice\Components\Core\Stack;
use Bambamboole\Lattice\Components\Core\Tab;
use Bambamboole\Lattice\Components\Core\Tabs;
use Bambamboole\Lattice\Components\Core\Text;
use Bambamboole\Lattice\Components\Form\Choice;
use Bambamboole\Lattice\Components\Form\Form;
use Bambamboole\Lattice\Components\Form\PasswordInput;
use Bambamboole\Lattice\Components\Table\Table;
use Bambamboole\Lattice\Concerns\CreatesToastMessages;
use Bambamboole\Lattice\Enums\Align;
use Bambamboole\Lattice\Enums\Gap;
use Bambamboole\Lattice\Enums\HttpMethod;
use Bambamboole\Lattice\Enums\LucideIcon;
use Bambamboole\Lattice\Enums\ToastType;
use Bambamboole\Lattice\Enums\Width;
use Bambamboole\Lattice\Facades\Lattice;
use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Fragments\FragmentDefinition;
use Bambamboole\Lattice\LatticeRegistry;
use Bambamboole\Lattice\Menu\MenuItem;
use Bambamboole\Lattice\Menu\MenuRegistry;
use Bambamboole\Lattice\Page;
use Bambamboole\Lattice\PageSchema;
use Bambamboole\Lattice\Tables\Columns\StackColumn;
use Bambamboole\Lattice\Tables\Columns\TextColumn;
use Bambamboole\Lattice\Tables\EloquentTableDefinition;
use Bambamboole\Lattice\Tables\PaginationType;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableQuery;
use Bambamboole\Lattice\Tables\TableResult;
use Bambamboole\Lattice\Tests\Fixtures\Discovery\DiscoveredPanelFragment;
use Bambamboole\Lattice\Tests\Fixtures\Discovery\DiscoveredPingAction;
use Bambamboole\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;
use Bambamboole\Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;
use Bambamboole\Lattice\Toasts\ToastMessage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\ResponseFactory;
use Inertia\Support\SessionKey;
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

enum WorkbenchMenuLocation: string
{
    case Sidebar = 'sidebar';
    case UserMenu = 'user-menu';
}

/**
 * @param  array<string, mixed>  $component
 */
function componentRef(array $component): string
{
    $props = $component['props'] ?? [];
    $ref = is_array($props) ? ($props['ref'] ?? null) : null;

    if (! is_string($ref)) {
        throw new RuntimeException('Lattice component ref is missing.');
    }

    expect($ref)->not->toBe('');

    return $ref;
}

function latticeUrl(string $url, string $ref): string
{
    $separator = str_contains($url, '?') ? '&' : '?';

    return $url.$separator.'_lattice='.rawurlencode($ref);
}

test('lattice component factories stay open for extension', function () {
    $badgeClass = (new class extends Badge {})::class;
    $badge = $badgeClass::make('Extended badge', 'extended-badge');

    expect($badge)->toBeInstanceOf($badgeClass)
        ->and((new ReflectionClass(Badge::class))->isFinal())->toBeFalse();
});

test('lattice facade resolves the registry and exposes the menu registry', function () {
    expect(Lattice::getFacadeRoot())->toBe(app(LatticeRegistry::class))
        ->and(Lattice::menus())->toBe(app(MenuRegistry::class));
});

test('lattice can discover attributed definitions from a path and namespace', function () {
    Lattice::discover(__DIR__.'/../Fixtures/Discovery', 'Bambamboole\\Lattice\\Tests\\Fixtures\\Discovery');

    $form = Form::use(DiscoveredProfileForm::class)->toArray();
    $table = Table::use(DiscoveredUsersTable::class)->toArray();
    $action = ActionComponent::use(DiscoveredPingAction::class)->toArray();
    $fragment = FragmentComponent::lazy(DiscoveredPanelFragment::class)->toArray();

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'fixtures.profile',
            'props' => [
                'action' => '/lattice/forms/fixtures.profile',
                'errorBag' => 'fixtures_profile',
                'method' => 'patch',
                'ref' => componentRef($form),
            ],
        ])
        ->and($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'fixtures.users',
        ])
        ->and($table['props']['endpoint'])->toBe('/lattice/tables/fixtures.users')
        ->and($table['props']['ref'])->toBe(componentRef($table))
        ->and($action)
        ->toMatchArray([
            'type' => 'action',
            'id' => 'fixtures.ping',
            'props' => [
                'endpoint' => '/lattice/actions/fixtures.ping',
                'label' => 'Ping',
                'method' => 'post',
                'ref' => componentRef($action),
            ],
        ])
        ->and($fragment)
        ->toMatchArray([
            'type' => 'fragment',
            'id' => 'fixtures.panel',
            'props' => [
                'endpoint' => '/lattice/fragments/fixtures.panel',
                'lazy' => true,
                'ref' => componentRef($fragment),
            ],
        ]);
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

test('interactive components seal request context for endpoints', function () {
    $form = Form::make('demo-form')
        ->action('/lattice/forms/demo-form')
        ->context(['team' => 'lattice-core'])
        ->toArray();
    $table = Table::make('demo-table')
        ->endpoint('/lattice/tables/demo-table')
        ->context(['team' => 'lattice-core'])
        ->toArray();

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'demo-form',
        ])
        ->and($form['props'])->toHaveKey('ref')
        ->and($form['props'])->not->toHaveKey('context')
        ->and($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'demo-table',
        ])
        ->and($table['props'])->toHaveKey('ref')
        ->and($table['props'])->not->toHaveKey('context');
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

test('password inputs can request automatic confirmation fields', function () {
    expect(PasswordInput::make('password', 'Password')
        ->required()
        ->passwordRules('minlength:8')
        ->needsConfirmation()
        ->toArray())
        ->toMatchArray([
            'type' => 'form.password-input',
            'props' => [
                'confirmation' => [
                    'label' => 'Confirm password',
                    'name' => 'password_confirmation',
                    'placeholder' => 'Confirm password',
                ],
                'label' => 'Password',
                'name' => 'password',
                'passwordRules' => 'minlength:8',
                'required' => true,
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

    $form = Form::use(WorkbenchProfileForm::class)->toArray();

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'settings.profile',
            'props' => [
                'action' => '/custom/forms/settings.profile',
                'errorBag' => 'settings_profile',
                'method' => 'patch',
                'ref' => componentRef($form),
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

    $ref = componentRef(Form::use(WorkbenchProfileForm::class)
        ->context(['team' => 'lattice-core'])
        ->toArray());

    patch('/lattice/forms/settings.profile', [
        'name' => 'Taylor',
        '_lattice' => $ref,
        'context' => [
            'team' => 'tampered-team',
        ],
    ])
        ->assertRedirect('/submitted');

    expect(session('handled-form'))->toBe('Taylor');
    expect(session('handled-form-team'))->toBe('lattice-core');
});

test('registered form endpoints require a valid component reference', function () {
    Lattice::forms([WorkbenchProfileForm::class]);

    patch('/lattice/forms/settings.profile', ['name' => 'Taylor'])
        ->assertForbidden();

    patch('/lattice/forms/settings.profile', [
        'name' => 'Taylor',
        '_lattice' => 'tampered',
    ])
        ->assertForbidden();
});

test('registered forms receive the current request while serializing definitions', function () {
    Lattice::forms([WorkbenchRequestAwareForm::class]);

    Route::get('request-aware-form', fn () => response()->json(Form::use(WorkbenchRequestAwareForm::class)->toArray()))
        ->middleware('web');

    getJson('/request-aware-form?label=Request aware')
        ->assertOk()
        ->assertJsonPath('children.0.props.text', 'Request aware');
});

test('registered tables serialize their configured endpoint columns state and initial data', function () {
    config(['lattice.tables.endpoint' => 'custom/tables/{table}']);

    Lattice::tables([WorkbenchUsersTable::class]);

    $table = Table::use(WorkbenchUsersTable::class)->toArray();

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.users',
                'ref' => componentRef($table),
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

    $table = Table::lazy(WorkbenchLazyUsersTable::class)->toArray();

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.lazy-users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.lazy-users',
                'lazy' => true,
                'ref' => componentRef($table),
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

    $ref = componentRef(Table::use(WorkbenchUsersTable::class)->toArray());

    getJson(latticeUrl('/lattice/tables/workbench.users?filter[status]=active&filter[name]=tay&sort=-name,email&page=2&per_page=50', $ref))
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

    $ref = componentRef(Table::use(WorkbenchUsersTable::class)->toArray());

    getJson(latticeUrl('/lattice/tables/workbench.users?filter[password]=secret', $ref))
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Filter [password] is not allowed for table [workbench.users].');

    getJson(latticeUrl('/lattice/tables/workbench.users?sort=password', $ref))
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Sort [password] is not allowed for table [workbench.users].');
});

test('registered table endpoints require a valid component reference and use trusted context', function () {
    Lattice::discover(__DIR__.'/../Fixtures/Discovery', 'Bambamboole\\Lattice\\Tests\\Fixtures\\Discovery');

    $ref = componentRef(Table::use(DiscoveredUsersTable::class)
        ->context(['team' => 'trusted-team'])
        ->toArray());

    getJson('/lattice/tables/fixtures.users')
        ->assertForbidden();

    getJson('/lattice/tables/fixtures.users?_lattice=tampered')
        ->assertForbidden();

    getJson(latticeUrl('/lattice/tables/fixtures.users?context[team]=tampered-team', $ref))
        ->assertOk()
        ->assertJsonPath('data.0.name', 'trusted-team');
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
    $ref = componentRef($table);

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

    getJson(latticeUrl('/lattice/tables/workbench.infinite-users?per_page=2', $ref))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.currentPage', 1)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2)
        ->assertJsonPath('state.page', 1)
        ->assertJsonPath('state.perPage', 2);

    getJson(latticeUrl('/lattice/tables/workbench.infinite-users?per_page=2&page=2', $ref))
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

    $ref = componentRef(Table::use(WorkbenchDefaultUsersTable::class)->toArray());

    getJson(latticeUrl('/lattice/tables/workbench.default-users?per_page=2', $ref))
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

    $ref = componentRef(Table::use(WorkbenchSimpleUsersTable::class)->toArray());

    getJson(latticeUrl('/lattice/tables/workbench.simple-users?per_page=2', $ref))
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

    $ref = componentRef(Table::use(WorkbenchSmallUsersTable::class)->toArray());

    getJson(latticeUrl('/lattice/tables/workbench.small-users?per_page=1', $ref))
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('pagination.mode', 'none')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.hasMore', false);
});

test('registered actions serialize their configured endpoint method label and effects', function () {
    config(['lattice.actions.endpoint' => 'custom/actions/{action}']);

    Lattice::actions([WorkbenchPingAction::class]);

    $action = ActionComponent::use(WorkbenchPingAction::class)->toArray();

    expect($action)
        ->toMatchArray([
            'type' => 'action',
            'id' => 'workbench.ping',
            'props' => [
                'endpoint' => '/custom/actions/workbench.ping',
                'label' => 'Ping',
                'method' => 'post',
                'ref' => componentRef($action),
                'variant' => 'secondary',
                'effects' => [
                    [
                        'type' => 'toast',
                        'message' => 'Ready.',
                        'variant' => 'success',
                    ],
                    [
                        'type' => 'reloadComponent',
                        'component' => 'workbench.users',
                    ],
                ],
            ],
        ]);
});

test('action groups serialize grouped child actions', function () {
    $group = ActionGroup::make('workbench.user-actions')
        ->label('Manage user')
        ->actions([
            ActionComponent::make('workbench.users.promote')
                ->endpoint('/lattice/actions/workbench.users.promote')
                ->label('Promote')
                ->method('patch'),
            ActionComponent::make('workbench.users.remove')
                ->endpoint('/lattice/actions/workbench.users.remove')
                ->label('Remove')
                ->method('delete')
                ->variant('destructive'),
        ])
        ->toArray();

    expect($group)
        ->toMatchArray([
            'type' => 'action.group',
            'id' => 'workbench.user-actions',
            'props' => [
                'label' => 'Manage user',
            ],
            'children' => [
                [
                    'type' => 'action',
                    'id' => 'workbench.users.promote',
                    'props' => [
                        'endpoint' => '/lattice/actions/workbench.users.promote',
                        'label' => 'Promote',
                        'method' => 'patch',
                        'ref' => componentRef($group['children'][0]),
                    ],
                ],
                [
                    'type' => 'action',
                    'id' => 'workbench.users.remove',
                    'props' => [
                        'endpoint' => '/lattice/actions/workbench.users.remove',
                        'label' => 'Remove',
                        'method' => 'delete',
                        'ref' => componentRef($group['children'][1]),
                        'variant' => 'destructive',
                    ],
                ],
            ],
        ]);
});

test('registered actions can be handled through the package endpoint', function () {
    Lattice::actions([WorkbenchPingAction::class]);

    $ref = componentRef(ActionComponent::use(WorkbenchPingAction::class)
        ->context(['team' => 'trusted-team'])
        ->toArray());

    postJson('/lattice/actions/workbench.ping', [
        'name' => 'Taylor',
        '_lattice' => $ref,
        'context' => [
            'team' => 'tampered-team',
        ],
    ])
        ->assertOk()
        ->assertJsonPath('ok', true)
        ->assertJsonPath('data.handled', 'Taylor')
        ->assertJsonPath('data.team', 'trusted-team')
        ->assertJsonPath('effects.0.type', 'toast')
        ->assertJsonPath('effects.0.message', 'Action handled.')
        ->assertJsonPath('effects.0.variant', 'info')
        ->assertJsonPath('effects.1.type', 'reloadComponent')
        ->assertJsonPath('effects.1.component', 'workbench.users');
});

test('toast messages serialize for flash data and action effects', function () {
    Route::get('toast-target', fn () => 'ok')->name('toast.target');

    $response = WorkbenchToastFactory::flashToast(ToastType::Warning, 'Review the settings.')
        ->toRoute('toast.target');
    $flashedToast = session()->get(SessionKey::FLASH_DATA, [])['toast'] ?? null;

    expect($response->getTargetUrl())
        ->toBe(route('toast.target'))
        ->and($flashedToast)
        ->toBeInstanceOf(ToastMessage::class);

    assert($flashedToast instanceof ToastMessage);

    expect($flashedToast->toArray())
        ->toBe([
            'type' => 'warning',
            'message' => 'Review the settings.',
        ])
        ->and(Effect::toast(ToastType::Warning, 'Review the settings.')->toArray())
        ->toBe([
            'type' => 'toast',
            'variant' => 'warning',
            'message' => 'Review the settings.',
        ])
        ->and(ActionResult::success()->toast('Saved.')->toArray())
        ->toMatchArray([
            'effects' => [
                [
                    'type' => 'toast',
                    'variant' => 'success',
                    'message' => 'Saved.',
                ],
            ],
        ])
        ->and(ActionResult::success()->toast(ToastType::Warning, 'Review the settings.')->toArray())
        ->toMatchArray([
            'effects' => [
                [
                    'type' => 'toast',
                    'variant' => 'warning',
                    'message' => 'Review the settings.',
                ],
            ],
        ]);
});

test('registered action endpoints require a valid component reference', function () {
    Lattice::actions([WorkbenchPingAction::class]);

    postJson('/lattice/actions/workbench.ping', ['name' => 'Taylor'])
        ->assertForbidden();

    postJson('/lattice/actions/workbench.ping', [
        'name' => 'Taylor',
        '_lattice' => 'tampered',
    ])
        ->assertForbidden();
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

test('modals serialize composable children for action driven dialogs', function () {
    expect(Modal::make('settings.two-factor-setup')
        ->title('Set up two-factor authentication')
        ->description('Scan the QR code with your authenticator app.')
        ->children([
            Text::make('Recovery codes will appear here.'),
        ])
        ->toArray())
        ->toMatchArray([
            'type' => 'modal',
            'id' => 'settings.two-factor-setup',
            'props' => [
                'title' => 'Set up two-factor authentication',
                'description' => 'Scan the QR code with your authenticator app.',
            ],
            'children' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Recovery codes will appear here.',
                    ],
                ],
            ],
        ]);
});

test('registered fragments serialize lazy endpoints and return component schemas', function () {
    Lattice::fragments([WorkbenchTwoFactorSetupFragment::class]);

    $fragment = FragmentComponent::lazy(WorkbenchTwoFactorSetupFragment::class)->toArray();
    $ref = componentRef($fragment);

    expect($fragment)
        ->toMatchArray([
            'type' => 'fragment',
            'id' => 'workbench.two-factor-setup',
            'props' => [
                'endpoint' => '/lattice/fragments/workbench.two-factor-setup',
                'lazy' => true,
                'ref' => $ref,
            ],
        ]);

    getJson('/lattice/fragments/workbench.two-factor-setup')
        ->assertForbidden();

    getJson('/lattice/fragments/workbench.two-factor-setup?_lattice=tampered')
        ->assertForbidden();

    getJson(latticeUrl('/lattice/fragments/workbench.two-factor-setup', $ref))
        ->assertOk()
        ->assertJsonPath('components.0.type', 'text')
        ->assertJsonPath('components.0.props.text', 'Authenticator setup loaded.');
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

test('pages can authorize requests before rendering', function () {
    Route::latticePage('authorized-page', WorkbenchAuthorizedPage::class)
        ->middleware('web')
        ->name('authorized-page.show');

    withoutVite();

    get('/authorized-page')
        ->assertForbidden();

    get('/authorized-page?allow=yes')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.components.0.props.text', 'Authorized page')
        );
});

test('page menu items are serialized by location and filtered through page authorization', function () {
    Route::latticePage('sidebar-visible', WorkbenchAuthorizedPage::class)
        ->middleware('web')
        ->name('sidebar.visible')
        ->menu(WorkbenchMenuLocation::Sidebar, fn ($item) => $item
            ->label('Visible page')
            ->icon(LucideIcon::Settings)
            ->group('Account')
            ->sort(20));

    Route::latticePage('sidebar-dashboard', WorkbenchInjectedPage::class)
        ->middleware('web')
        ->name('sidebar.dashboard')
        ->sidebar('Dashboard', LucideIcon::LayoutDashboard);

    Route::latticePage('sidebar-hidden', WorkbenchDeniedSidebarPage::class)
        ->middleware('web')
        ->name('sidebar.hidden')
        ->menu(WorkbenchMenuLocation::Sidebar, 'Hidden page', LucideIcon::EyeOff);

    Route::latticePage('user-menu-settings', WorkbenchAuthorizedPage::class)
        ->middleware('web')
        ->name('user-menu.settings')
        ->menu(WorkbenchMenuLocation::UserMenu, 'Settings', LucideIcon::Settings);

    Lattice::menus()->add(
        WorkbenchMenuLocation::UserMenu,
        MenuItem::make('logout')
            ->label('Log out')
            ->icon(LucideIcon::LogOut)
            ->href('/logout')
            ->method(HttpMethod::Post)
            ->sort(100),
    );

    withoutVite();

    get('/sidebar-visible?allow=yes')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.menus.sidebar.groups.0.label', null)
            ->where('lattice.menus.sidebar.groups.0.items.0.label', 'Dashboard')
            ->where('lattice.menus.sidebar.groups.0.items.0.href', '/sidebar-dashboard')
            ->where('lattice.menus.sidebar.groups.0.items.0.icon', 'layout-dashboard')
            ->where('lattice.menus.sidebar.groups.0.items.0.method', 'get')
            ->where('lattice.menus.sidebar.groups.0.items.0.active', false)
            ->where('lattice.menus.sidebar.groups.1.label', 'Account')
            ->where('lattice.menus.sidebar.groups.1.items.0.label', 'Visible page')
            ->where('lattice.menus.sidebar.groups.1.items.0.href', '/sidebar-visible')
            ->where('lattice.menus.sidebar.groups.1.items.0.icon', 'settings')
            ->where('lattice.menus.sidebar.groups.1.items.0.method', 'get')
            ->where('lattice.menus.sidebar.groups.1.items.0.active', true)
            ->missing('lattice.menus.sidebar.groups.1.items.1')
            ->where('lattice.menus.user-menu.groups.0.items.0.label', 'Settings')
            ->where('lattice.menus.user-menu.groups.0.items.0.href', '/user-menu-settings')
            ->where('lattice.menus.user-menu.groups.0.items.0.icon', 'settings')
            ->where('lattice.menus.user-menu.groups.0.items.0.method', 'get')
            ->where('lattice.menus.user-menu.groups.0.items.1.label', 'Log out')
            ->where('lattice.menus.user-menu.groups.0.items.1.href', '/logout')
            ->where('lattice.menus.user-menu.groups.0.items.1.icon', 'log-out')
            ->where('lattice.menus.user-menu.groups.0.items.1.method', 'post')
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
            return 'custom';
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
            'layout' => 'custom',
            'container' => 'default',
        ]);
});

test('pages serialize breadcrumb metadata', function () {
    $page = new class extends Page
    {
        public function breadcrumbs(): array
        {
            return [
                [
                    'title' => 'Dashboard',
                    'href' => '/demo/dashboard',
                ],
            ];
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Dashboard'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make())))
        ->toMatchArray([
            'breadcrumbs' => [
                [
                    'title' => 'Dashboard',
                    'href' => '/demo/dashboard',
                ],
            ],
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
    public function definition(Form $form, Request $request): Form
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
        $request->session()->put('handled-form-team', $this->context($request, 'team'));

        return redirect('/submitted');
    }
}

#[Bambamboole\Lattice\Attributes\Form('workbench.request-aware')]
class WorkbenchRequestAwareForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form->schema([
            Text::make($request->string('label', 'Fallback label')->toString()),
        ]);
    }

    public function handle(Request $request): Response
    {
        return response()->noContent();
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

final class WorkbenchAuthorizedPage extends Page
{
    public function authorize(Request $request): bool
    {
        return $request->query('allow') === 'yes';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Authorized page'));
    }
}

final class WorkbenchDeniedSidebarPage extends Page
{
    public function authorize(Request $request): bool
    {
        return false;
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Hidden page'));
    }
}

#[Fragment('workbench.two-factor-setup')]
final class WorkbenchTwoFactorSetupFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Authenticator setup loaded.'));
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
            'team' => data_get($request->input('context', []), 'team'),
        ])
            ->toast(ToastType::Info, 'Action handled.')
            ->reloadComponent('workbench.users');
    }
}

final class WorkbenchToastFactory
{
    use CreatesToastMessages;

    public static function flashToast(ToastType $type, string $message): ResponseFactory
    {
        return (new self)->toast($type, $message);
    }
}
