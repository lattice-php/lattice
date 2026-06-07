<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Badge;
use Bambamboole\Lattice\Components\Form;
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
use Bambamboole\Lattice\Tables\Columns\TextColumn;
use Bambamboole\Lattice\Tables\TableDefinition;
use Bambamboole\Lattice\Tables\TableQuery;
use Bambamboole\Lattice\Tables\TableResult;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Pages\WorkbenchHomePage;
use Workbench\App\Seeders\WorkbenchUserSeeder;
use Workbench\App\Tables\UsersTable as WorkbenchAppUsersTable;

use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\patch;
use function Pest\Laravel\withoutVite;

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
                'defaultValue' => 'security',
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

test('the workbench home route uses a workbench-owned page directly', function () {
    expect(Route::getRoutes()->getByName('home')?->getActionName())->toBe(WorkbenchHomePage::class);
});


test('workbench pages serialize package component trees for inertia', function () {
    withoutVite();

    get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Lattice Workbench')
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
