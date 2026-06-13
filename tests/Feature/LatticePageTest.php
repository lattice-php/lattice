<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Testing\TestResponse;
use Inertia\ResponseFactory;
use Inertia\Support\SessionKey;
use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionRegistry;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Actions\Effect;
use Lattice\Lattice\Attributes\Action;
use Lattice\Lattice\Attributes\Form as FormAttribute;
use Lattice\Lattice\Attributes\Fragment;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Attributes\Table as TableAttribute;
use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Components\Modal;
use Lattice\Lattice\Core\Components\SegmentedControl;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Concerns\CreatesToastMessages;
use Lattice\Lattice\Core\Enums\Align;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\Enums\ToastVariant;
use Lattice\Lattice\Core\Enums\Width;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Core\Values\ToastMessage;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\PasswordInput;
use Lattice\Lattice\Forms\FormDefinition;
use Lattice\Lattice\Fragments\Components\Fragment as FragmentComponent;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\LatticeRegistry;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredArchiveBulkAction;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredPanelFragment;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredPingAction;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProfileForm;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredUsersTable;
use Orchestra\Testbench\Factories\UserFactory;
use Symfony\Component\HttpFoundation\Response;
use Workbench\App\Pages\HomePage;
use Workbench\App\Pages\TablesPage;
use Workbench\App\Seeders\UserSeeder;
use Workbench\App\Tables\UsersTable as WorkbenchAppUsersTable;

use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\patch;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutVite;
use function Pest\Laravel\withSession;

/**
 * @return TestResponse<JsonResponse>
 */
function latticeGet(string $url, string $ref): TestResponse
{
    return getJson($url, latticeHeaders($ref));
}

function exposesSchemaApi(object $component): bool
{
    return method_exists($component, 'schema');
}

test('lattice component factories stay open for extension', function () {
    $badgeClass = (new class extends Badge {})::class;
    $badge = $badgeClass::make('Extended badge', 'extended-badge');

    expect($badge)->toBeInstanceOf($badgeClass)
        ->and((new ReflectionClass(Badge::class))->isFinal())->toBeFalse();
});

test('lattice facade resolves the registry', function () {
    expect(Lattice::getFacadeRoot())->toBe(app(LatticeRegistry::class));
});

test('lattice can discover attributed definitions from a path and namespace', function () {
    Lattice::discover(__DIR__.'/../Fixtures/Discovery', 'Lattice\\Lattice\\Tests\\Fixtures\\Discovery');

    $form = wire(Form::use(DiscoveredProfileForm::class));
    $table = wire(Table::use(DiscoveredUsersTable::class));
    $action = wire(ActionComponent::use(DiscoveredPingAction::class));
    $fragment = wire(FragmentComponent::lazy(DiscoveredPanelFragment::class));

    expect($form)
        ->toMatchArray([
            'type' => 'form',
            'id' => 'fixtures.profile',
            'props' => [
                'action' => '/lattice/forms/fixtures.profile',
                'errorBag' => 'fixtures_profile',
                'method' => 'patch',
                'ref' => componentRef($form),
                'submitLabel' => null,
                'validationSummaryLabel' => 'Fix these fields to continue:',
                'precognitive' => null,
                'validationTimeout' => null,
                'submitButton' => null,
                'resetOnSuccess' => null,
                'resetOnError' => null,
                'status' => null,
                'state' => [],
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
                'icon' => null,
                'confirmation' => null,
                'effects' => [],
                'form' => null,
                'lazyForm' => null,
                'variant' => null,
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

test('lattice discovers attributed bulk action definitions', function () {
    Lattice::discover(__DIR__.'/../Fixtures/Discovery', 'Lattice\\Lattice\\Tests\\Fixtures\\Discovery');

    expect(app(BulkActionRegistry::class)->resolve('fixtures.archive'))
        ->toBeInstanceOf(DiscoveredArchiveBulkAction::class);
});

test('interactive components keep their serialized ids', function () {
    expect(wire(Form::make('demo-form')))
        ->toMatchArray([
            'type' => 'form',
            'id' => 'demo-form',
        ])
        ->and(wire(Table::make('demo-table')))
        ->toMatchArray([
            'type' => 'table',
            'id' => 'demo-table',
        ]);
});

test('interactive components seal request context for endpoints', function () {
    $form = wire(Form::make('demo-form')
        ->action('/lattice/forms/demo-form')
        ->context(['team' => 'lattice-core']));
    $table = wire(Table::make('demo-table')
        ->endpoint('/lattice/tables/demo-table')
        ->context(['team' => 'lattice-core']));

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
    expect(wire(Form::make('profile-form')->schema([
        Text::make('Profile details'),
    ])))
        ->toMatchArray([
            'type' => 'form',
            'id' => 'profile-form',
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Profile details',
                        'align' => null,
                    ],
                ],
            ],
        ]);
});

test('only container components expose a schema', function () {
    $containerComponents = [
        Card::make('Card', 'Description'),
        Grid::make(),
        Stack::make(),
        FragmentComponent::make('fragment'),
        Modal::make('modal'),
        Form::make('profile-form'),
        ActionGroup::make('row-actions'),
        Tab::make('profile', 'Profile'),
        Tabs::make(),
    ];

    $leafComponents = [
        Badge::make('Badge'),
        Button::make('Button'),
        Heading::make('Heading'),
        Link::make('Link'),
        Text::make('Text'),
        ActionComponent::make('action'),
        Table::make('users'),
        Choice::make('appearance', 'Appearance'),
    ];

    foreach ($containerComponents as $component) {
        expect(exposesSchemaApi($component))->toBeTrue();
    }

    foreach ($leafComponents as $component) {
        expect(exposesSchemaApi($component))->toBeFalse();
    }
});

test('components serialize through prioritized hook attributes without child-specific base hooks', function () {
    $component = new class extends Component
    {
        protected function type(): string
        {
            return 'hooked';
        }

        /**
         * @param  array<string, mixed>  $data
         * @return array<string, mixed>
         */
        #[SerializationHook(priority: 500)]
        protected function serialiseCustomData(array $data): array
        {
            return [
                ...$data,
                'empty' => [],
                'custom' => 'value',
            ];
        }
    };

    expect(wire($component))
        ->toBe([
            'type' => 'hooked',
            'props' => [],
            'custom' => 'value',
        ])
        ->and(method_exists(Component::class, 'serializedChildren'))
        ->toBeFalse()
        ->and((new ReflectionClass(Component::class))->hasProperty('serialisationHooks'))
        ->toBeFalse();
});

test('private serialization hooks are ignored', function () {
    $component = new class extends Component
    {
        protected function type(): string
        {
            return 'private-hooked';
        }

        /**
         * @param  array<string, mixed>  $data
         * @return array<string, mixed>
         */
        public function privateDataForTest(array $data): array
        {
            return $this->serialisePrivateData($data);
        }

        /**
         * @param  array<string, mixed>  $data
         * @return array<string, mixed>
         */
        #[SerializationHook(priority: 500)]
        private function serialisePrivateData(array $data): array
        {
            return [
                ...$data,
                'private' => 'value',
            ];
        }
    };

    expect(wire($component))->toBe([
        'type' => 'private-hooked',
        'props' => [],
    ])->and($component->privateDataForTest([]))->toBe([
        'private' => 'value',
    ]);
});

test('forms can disable their default submit button', function () {
    expect(wire(Form::make('profile-form')->withoutSubmitButton()))
        ->toMatchArray([
            'type' => 'form',
            'id' => 'profile-form',
            'props' => [
                'submitButton' => false,
                'action' => null,
                'method' => null,
                'submitLabel' => null,
                'validationSummaryLabel' => 'Fix these fields to continue:',
                'precognitive' => null,
                'validationTimeout' => null,
                'resetOnSuccess' => null,
                'resetOnError' => null,
                'status' => null,
                'errorBag' => null,
                'state' => [],
                'ref' => null,
            ],
        ]);
});

test('password inputs can request automatic confirmation fields', function () {
    expect(wire(PasswordInput::make('password', 'Password')
        ->required()
        ->passwordRules('minlength:8')
        ->needsConfirmation()))
        ->toMatchArray([
            'type' => 'form.password-input',
            'props' => [
                'confirmation' => [
                    'label' => 'Confirm password',
                    'name' => 'password_confirmation',
                    'placeholder' => 'Confirm password',
                ],
                'label' => 'Password',
                'helperText' => null,
                'name' => 'password',
                'passwordRules' => 'minlength:8',
                'required' => true,
                'labelAction' => null,
                'value' => null,
                'hidden' => null,
                'readOnly' => null,
                'disabled' => null,
                'conditions' => null,
                'dependsOnKeys' => null,
                'dependsOnAny' => null,
                'prefill' => null,
                'prefillResetOn' => null,
                'prefillRefreshOn' => null,
                'autoComplete' => null,
                'autoFocus' => null,
                'placeholder' => null,
                'tabIndex' => null,
            ],
        ]);
});

test('components can opt out of rendering with when', function () {
    $page = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->schema([
                Text::make('Visible root'),
                Text::make('Hidden root')->when(false),
                Stack::make('nested')->schema([
                    Text::make('Visible child'),
                    Text::make('Hidden child')->when(false),
                ]),
            ]);
        }
    };

    $pageData = wire($page->toArray($page->render(PageSchema::make()), new Request));

    expect($pageData['schema'])
        ->toHaveCount(2)
        ->and($pageData['schema'][0]['props']['text'])->toBe('Visible root')
        ->and($pageData['schema'][1]['schema'])->toHaveCount(1)
        ->and($pageData['schema'][1]['schema'][0]['props']['text'])->toBe('Visible child');
});

test('segmented control serializes options value and emit event', function () {
    expect(wire(SegmentedControl::make('appearance', 'Appearance')
        ->value('system')
        ->emits('lattice:appearance-change')
        ->options([
            SegmentedControl::option('Light', 'light'),
            SegmentedControl::option('Dark', 'dark'),
            SegmentedControl::option('System', 'system'),
        ])))
        ->toMatchArray([
            'type' => 'segmented-control',
            'props' => [
                'label' => 'Appearance',
                'name' => 'appearance',
                'value' => 'system',
                'emits' => 'lattice:appearance-change',
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

    $form = wire(Form::use(WorkbenchProfileForm::class));

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
                'submitLabel' => null,
                'validationSummaryLabel' => 'Fix these fields to continue:',
                'precognitive' => null,
                'validationTimeout' => null,
                'resetOnSuccess' => null,
                'resetOnError' => null,
                'status' => null,
                'state' => [],
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Profile details',
                        'align' => null,
                    ],
                ],
            ],
        ]);
});

test('registered forms can be submitted through the package endpoint', function () {
    Lattice::forms([WorkbenchProfileForm::class]);

    $ref = componentRef(wire(Form::use(WorkbenchProfileForm::class)
        ->context(['team' => 'lattice-core'])));

    patch('/lattice/forms/settings.profile', [
        'name' => 'Taylor',
        'context' => [
            'team' => 'tampered-team',
        ],
    ], latticeHeaders($ref))
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
    ], latticeHeaders('tampered'))
        ->assertForbidden();
});

test('registered forms receive the current request while serializing definitions', function () {
    Lattice::forms([WorkbenchRequestAwareForm::class]);

    Route::get('request-aware-form', fn () => response()->json(wire(Form::use(WorkbenchRequestAwareForm::class))))
        ->middleware('web');

    getJson('/request-aware-form?label=Request aware')
        ->assertOk()
        ->assertJsonPath('schema.0.props.text', 'Request aware');
});

test('registered tables serialize their configured endpoint columns state and initial data', function () {
    config(['lattice.tables.endpoint' => 'custom/tables/{table}']);

    Lattice::tables([WorkbenchUsersTable::class]);

    $table = wire(Table::use(WorkbenchUsersTable::class));

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.users',
                'ref' => componentRef($table),
                'layout' => null,
                'bulkActions' => [],
                'striped' => null,
                'lazy' => null,
                'actionsLabel' => 'Actions',
                'emptyLabel' => 'No results',
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                        'sortable' => true,
                        'filter' => [
                            'enabled' => true,
                            'type' => 'text',
                            'operators' => ['contains', 'starts_with', 'ends_with', 'eq', 'neq', 'empty', 'filled'],
                            'defaultOperator' => 'contains',
                        ],
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                    ],
                    [
                        'key' => 'status',
                        'label' => 'Status',
                        'type' => 'text',
                        'sortable' => null,
                        'filter' => [
                            'enabled' => true,
                            'type' => 'text',
                            'operators' => ['contains', 'starts_with', 'ends_with', 'eq', 'neq', 'empty', 'filled'],
                            'defaultOperator' => 'eq',
                        ],
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email',
                        'type' => 'text',
                        'sortable' => true,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                    ],
                ],
                'data' => [
                    [
                        'name' => 'Taylor',
                        'filters' => [],
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

    $table = wire(Table::lazy(WorkbenchLazyUsersTable::class));

    expect($table)
        ->toMatchArray([
            'type' => 'table',
            'id' => 'workbench.lazy-users',
            'props' => [
                'endpoint' => '/custom/tables/workbench.lazy-users',
                'lazy' => true,
                'ref' => componentRef($table),
                'layout' => null,
                'bulkActions' => [],
                'striped' => null,
                'actionsLabel' => 'Actions',
                'emptyLabel' => 'No results',
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                        'sortable' => null,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
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

    $table = wire(Table::use(WorkbenchStackedUsersTable::class));

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
                'sortable' => null,
                'filter' => null,
                'columns' => [
                    [
                        'key' => 'name',
                        'label' => 'Name',
                        'type' => 'text',
                        'sortable' => true,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                    ],
                    [
                        'key' => 'email',
                        'label' => 'Email',
                        'type' => 'text',
                        'sortable' => null,
                        'filter' => null,
                        'columns' => null,
                        'props' => ['date' => null, 'copyable' => false, 'link' => null],
                    ],
                ],
                'props' => null,
            ],
            [
                'key' => 'status',
                'label' => 'Status',
                'type' => 'text',
                'sortable' => null,
                'filter' => null,
                'columns' => null,
                'props' => ['date' => null, 'copyable' => false, 'link' => null],
            ],
        ])
        ->and($table['props']['data'][0]['actions'][0])->toMatchArray([
            'type' => 'action',
            'id' => 'workbench.ping',
        ])
        ->and($table['props']['data'][0]['actions'][0]['props'])
        ->toMatchArray([
            'label' => 'Ping',
            'method' => 'post',
        ]);
});

test('registered tables parse clause filters sorts and pagination through the endpoint', function () {
    Lattice::tables([WorkbenchUsersTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchUsersTable::class)));

    latticeGet('/lattice/tables/workbench.users?filter=name:contains:tay,status:eq:active&sort=-name,email&page=2&per_page=50', $ref)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Taylor')
        ->assertJsonPath('data.0.filters.0', ['field' => 'name', 'operator' => 'contains', 'value' => 'tay'])
        ->assertJsonPath('data.0.filters.1', ['field' => 'status', 'operator' => 'eq', 'value' => 'active'])
        ->assertJsonPath('data.0.sorts.0.key', 'name')
        ->assertJsonPath('data.0.sorts.0.direction', 'desc')
        ->assertJsonPath('data.0.sorts.1.key', 'email')
        ->assertJsonPath('data.0.sorts.1.direction', 'asc')
        ->assertJsonPath('state.filters.0.field', 'name')
        ->assertJsonPath('state.filters.1.field', 'status')
        ->assertJsonPath('state.page', 2)
        ->assertJsonPath('state.perPage', 50);
});

test('registered tables reject filters and sorts that are not allowed by columns', function () {
    Lattice::tables([WorkbenchUsersTable::class]);

    $ref = componentRef(wire(Table::use(WorkbenchUsersTable::class)));

    latticeGet('/lattice/tables/workbench.users?filter=password:contains:secret', $ref)
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Filter [password] is not allowed for table [workbench.users].')
        ->assertJsonPath('errors.filter.0', 'Filter [password] is not allowed for table [workbench.users].');

    latticeGet('/lattice/tables/workbench.users?sort=password', $ref)
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Sort [password] is not allowed for table [workbench.users].')
        ->assertJsonPath('errors.sort.0', 'Sort [password] is not allowed for table [workbench.users].');
});

test('registered table endpoints require a valid component reference and use trusted context', function () {
    Lattice::discover(__DIR__.'/../Fixtures/Discovery', 'Lattice\\Lattice\\Tests\\Fixtures\\Discovery');

    $ref = componentRef(wire(Table::use(DiscoveredUsersTable::class)
        ->context(['team' => 'trusted-team'])));

    getJson('/lattice/tables/fixtures.users')
        ->assertForbidden();

    getJson('/lattice/tables/fixtures.users', latticeHeaders('tampered'))
        ->assertForbidden();

    latticeGet('/lattice/tables/fixtures.users?context[team]=tampered-team', $ref)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'trusted-team');
});

test('text columns serialize display modifiers', function () {
    expect(wire(TextColumn::make('published_at')
        ->label('Published')
        ->date('Y-m-d')
        ->copyable()
        ->link('/posts/{id}')))
        ->toMatchArray([
            'key' => 'published_at',
            'label' => 'Published',
            'type' => 'text',
            'props' => [
                'date' => ['format' => 'Y-m-d'],
                'copyable' => true,
                'link' => ['href' => '/posts/{id}', 'external' => false],
            ],
        ]);
});

test('workbench users table exposes timestamp columns for each row', function () {
    Lattice::tables([WorkbenchAppUsersTable::class]);

    $columns = wire(Table::use(WorkbenchAppUsersTable::class))['props']['columns'];

    expect(array_column($columns, 'key'))->toBe(['name', 'email', 'created_at', 'updated_at'])
        ->and($columns[2])->toMatchArray([
            'key' => 'created_at',
            'label' => 'Created at',
            'sortable' => true,
            'props' => ['date' => ['format' => 'Y-m-d H:i:s'], 'copyable' => false, 'link' => null],
        ])
        ->and($columns[3])->toMatchArray([
            'key' => 'updated_at',
            'label' => 'Updated at',
            'sortable' => true,
            'props' => ['date' => ['format' => 'Y-m-d H:i:s'], 'copyable' => false, 'link' => null],
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

    $table = wire(Table::use(WorkbenchInfiniteUsersTable::class));
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

    latticeGet('/lattice/tables/workbench.infinite-users?per_page=2', $ref)
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('pagination.mode', 'infinite')
        ->assertJsonPath('pagination.currentPage', 1)
        ->assertJsonPath('pagination.hasMore', true)
        ->assertJsonPath('pagination.nextPage', 2)
        ->assertJsonPath('state.page', 1)
        ->assertJsonPath('state.perPage', 2);

    latticeGet('/lattice/tables/workbench.infinite-users?per_page=2&page=2', $ref)
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

    $ref = componentRef(wire(Table::use(WorkbenchDefaultUsersTable::class)));

    latticeGet('/lattice/tables/workbench.default-users?per_page=2', $ref)
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

    $ref = componentRef(wire(Table::use(WorkbenchSimpleUsersTable::class)));

    latticeGet('/lattice/tables/workbench.simple-users?per_page=2', $ref)
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

    $ref = componentRef(wire(Table::use(WorkbenchSmallUsersTable::class)));

    latticeGet('/lattice/tables/workbench.small-users?per_page=1', $ref)
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('pagination.mode', 'none')
        ->assertJsonPath('pagination.total', 3)
        ->assertJsonPath('pagination.hasMore', false);
});

test('registered actions serialize their configured endpoint method label and effects', function () {
    config(['lattice.actions.endpoint' => 'custom/actions/{action}']);

    Lattice::actions([WorkbenchPingAction::class]);

    $action = wire(ActionComponent::use(WorkbenchPingAction::class));

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
                'icon' => null,
                'confirmation' => null,
                'form' => null,
                'lazyForm' => null,
                'effects' => [
                    [
                        'type' => 'toast',
                        'toast' => [
                            'variant' => 'success',
                            'message' => 'Ready.',
                            'duration' => null,
                            'persistent' => false,
                            'dismissible' => true,
                            'action' => null,
                        ],
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
    $group = wire(ActionGroup::make('workbench.user-actions')
        ->label('Manage user')
        ->actions([
            ActionComponent::make('workbench.users.promote')
                ->endpoint('/lattice/actions/workbench.users.promote')
                ->label('Promote')
                ->method(HttpMethod::Patch),
            ActionComponent::make('workbench.users.remove')
                ->endpoint('/lattice/actions/workbench.users.remove')
                ->label('Remove')
                ->method(HttpMethod::Delete)
                ->variant(ButtonVariant::Destructive),
        ]));

    expect($group)
        ->toMatchArray([
            'type' => 'action.group',
            'id' => 'workbench.user-actions',
            'props' => [
                'label' => 'Manage user',
                'ref' => null,
            ],
            'schema' => [
                [
                    'type' => 'action',
                    'id' => 'workbench.users.promote',
                    'props' => [
                        'endpoint' => '/lattice/actions/workbench.users.promote',
                        'label' => 'Promote',
                        'method' => 'patch',
                        'icon' => null,
                        'confirmation' => null,
                        'effects' => [],
                        'form' => null,
                        'lazyForm' => null,
                        'variant' => null,
                        'ref' => componentRef($group['schema'][0]),
                    ],
                ],
                [
                    'type' => 'action',
                    'id' => 'workbench.users.remove',
                    'props' => [
                        'endpoint' => '/lattice/actions/workbench.users.remove',
                        'label' => 'Remove',
                        'method' => 'delete',
                        'icon' => null,
                        'confirmation' => null,
                        'effects' => [],
                        'form' => null,
                        'lazyForm' => null,
                        'variant' => 'destructive',
                        'ref' => componentRef($group['schema'][1]),
                    ],
                ],
            ],
        ]);
});

test('registered actions can be handled through the package endpoint', function () {
    Lattice::actions([WorkbenchPingAction::class]);

    $ref = componentRef(wire(ActionComponent::use(WorkbenchPingAction::class)
        ->context(['team' => 'trusted-team'])));

    postJson('/lattice/actions/workbench.ping', [
        'name' => 'Taylor',
        'context' => [
            'team' => 'tampered-team',
        ],
    ], latticeHeaders($ref))
        ->assertOk()
        ->assertJsonPath('ok', true)
        ->assertJsonPath('data.handled', 'Taylor')
        ->assertJsonPath('data.team', 'trusted-team')
        ->assertJsonPath('effects.0.type', 'toast')
        ->assertJsonPath('effects.0.toast.message', 'Action handled.')
        ->assertJsonPath('effects.0.toast.variant', 'info')
        ->assertJsonPath('effects.1.type', 'reloadComponent')
        ->assertJsonPath('effects.1.component', 'workbench.users');
});

test('toast messages serialize for flash data and action effects', function () {
    Route::get('toast-target', fn () => 'ok')->name('toast.target');

    $response = WorkbenchToastFactory::flashToast(ToastVariant::Warning, 'Review the settings.')
        ->toRoute('toast.target');
    $flashedToast = session()->get(SessionKey::FLASH_DATA, [])['toast'] ?? null;

    expect($response->getTargetUrl())
        ->toBe(route('toast.target'))
        ->and($flashedToast)
        ->toBeInstanceOf(ToastMessage::class);

    assert($flashedToast instanceof ToastMessage);

    expect(wire($flashedToast))
        ->toBe([
            'variant' => 'warning',
            'message' => 'Review the settings.',
            'duration' => null,
            'persistent' => false,
            'dismissible' => true,
            'action' => null,
        ])
        ->and(wire(Effect::toast(ToastVariant::Warning, 'Review the settings.')))
        ->toBe([
            'type' => 'toast',
            'toast' => [
                'variant' => 'warning',
                'message' => 'Review the settings.',
                'duration' => null,
                'persistent' => false,
                'dismissible' => true,
                'action' => null,
            ],
        ])
        ->and(wire(ActionResult::success()->toast('Saved.')))
        ->toMatchArray([
            'effects' => [
                [
                    'type' => 'toast',
                    'toast' => [
                        'variant' => 'success',
                        'message' => 'Saved.',
                        'duration' => null,
                        'persistent' => false,
                        'dismissible' => true,
                        'action' => null,
                    ],
                ],
            ],
        ])
        ->and(wire(ActionResult::success()->toast(ToastVariant::Warning, 'Review the settings.')))
        ->toMatchArray([
            'effects' => [
                [
                    'type' => 'toast',
                    'toast' => [
                        'variant' => 'warning',
                        'message' => 'Review the settings.',
                        'duration' => null,
                        'persistent' => false,
                        'dismissible' => true,
                        'action' => null,
                    ],
                ],
            ],
        ]);
});

test('a toast serializes its lifetime, dismissibility and link', function () {
    $wire = wire(Effect::toast(
        ToastMessage::make(ToastVariant::Success, 'Saved.')
            ->duration(8000)
            ->dismissible(false)
            ->link('Undo', '/undo', HttpMethod::Patch),
    ));

    expect($wire['type'])->toBe('toast')
        ->and($wire['toast']['duration'])->toBe(8000)
        ->and($wire['toast']['persistent'])->toBeFalse()
        ->and($wire['toast']['dismissible'])->toBeFalse()
        ->and($wire['toast']['action']['type'])->toBe('link')
        ->and($wire['toast']['action']['props']['label'])->toBe('Undo')
        ->and($wire['toast']['action']['props']['href'])->toBe('/undo')
        ->and($wire['toast']['action']['props']['method'])->toBe('patch');
});

test('a toast can carry an action component', function () {
    $wire = wire(Effect::toast(
        ToastMessage::make(ToastVariant::Info, 'Done.')
            ->persistent()
            ->action(ActionComponent::make('demo.toast-action')->endpoint('/x')->label('Open')),
    ));

    expect($wire['toast']['persistent'])->toBeTrue()
        ->and($wire['toast']['action']['type'])->toBe('action')
        ->and($wire['toast']['action']['props']['label'])->toBe('Open')
        ->and($wire['toast']['action']['props']['endpoint'])->toBe('/x');
});

test('registered action endpoints require a valid component reference', function () {
    Lattice::actions([WorkbenchPingAction::class]);

    postJson('/lattice/actions/workbench.ping', ['name' => 'Taylor'])
        ->assertForbidden();

    postJson('/lattice/actions/workbench.ping', [
        'name' => 'Taylor',
    ], latticeHeaders('tampered'))
        ->assertForbidden();
});

test('action results expose the full effect vocabulary', function () {
    $result = ActionResult::success()
        ->reloadPage()
        ->redirect('/dashboard')
        ->download('/exports/report.csv')
        ->resetForm('teams.create');

    expect(wire($result)['effects'])->toBe([
        ['type' => 'reloadPage'],
        ['type' => 'redirect', 'url' => '/dashboard'],
        ['type' => 'download', 'url' => '/exports/report.csv'],
        ['type' => 'resetForm', 'form' => 'teams.create'],
    ])
        ->and(wire(Effect::resetForm()))->toBe(['type' => 'resetForm', 'form' => null])
        ->and(wire(Effect::reloadPage()))->toBe(['type' => 'reloadPage']);
});

test('interaction endpoints return 404 for unknown component ids', function () {
    $signer = app(ComponentReferenceSigner::class);
    $refs = [
        'action' => $signer->seal('action', 'workbench.missing', []),
        'form' => $signer->seal('form', 'workbench.missing', []),
        'table' => $signer->seal('table', 'workbench.missing', []),
        'fragment' => $signer->seal('fragment', 'workbench.missing', []),
    ];

    postJson('/lattice/actions/workbench.missing', [], latticeHeaders($refs['action']))
        ->assertNotFound();
    patch('/lattice/forms/workbench.missing', [], latticeHeaders($refs['form']))
        ->assertNotFound();
    latticeGet('/lattice/tables/workbench.missing', $refs['table'])
        ->assertNotFound();
    latticeGet('/lattice/fragments/workbench.missing', $refs['fragment'])
        ->assertNotFound();
});

test('interaction endpoints re-run authorization for every interaction', function () {
    Lattice::actions([WorkbenchDeniedAction::class]);
    Lattice::forms([WorkbenchDeniedForm::class]);
    Lattice::tables([WorkbenchDeniedTable::class]);
    Lattice::fragments([WorkbenchDeniedFragment::class]);

    $signer = app(ComponentReferenceSigner::class);
    $refs = [
        'action' => $signer->seal('action', 'workbench.denied', []),
        'form' => $signer->seal('form', 'workbench.denied', []),
        'table' => $signer->seal('table', 'workbench.denied', []),
        'fragment' => $signer->seal('fragment', 'workbench.denied', []),
    ];

    postJson('/lattice/actions/workbench.denied', [], latticeHeaders($refs['action']))
        ->assertForbidden();
    patch('/lattice/forms/workbench.denied', [], latticeHeaders($refs['form']))
        ->assertForbidden();
    latticeGet('/lattice/tables/workbench.denied', $refs['table'])
        ->assertForbidden();
    latticeGet('/lattice/fragments/workbench.denied', $refs['fragment'])
        ->assertForbidden();
});

test('actions can serialize confirmation modal configuration', function () {
    expect(wire(ActionComponent::make('delete-account')
        ->label('Delete account')
        ->method(HttpMethod::Delete)
        ->variant(ButtonVariant::Destructive)
        ->confirm(
            title: 'Delete account?',
            description: 'This cannot be undone.',
            confirmLabel: 'Delete account',
            cancelLabel: 'Keep account',
        )))
        ->toMatchArray([
            'type' => 'action',
            'id' => 'delete-account',
            'props' => [
                'endpoint' => null,
                'label' => 'Delete account',
                'method' => 'delete',
                'icon' => null,
                'confirmation' => [
                    'title' => 'Delete account?',
                    'description' => 'This cannot be undone.',
                    'confirmLabel' => 'Delete account',
                    'cancelLabel' => 'Keep account',
                ],
                'effects' => [],
                'form' => null,
                'lazyForm' => null,
                'variant' => 'destructive',
                'ref' => null,
            ],
        ]);
});

test('modals serialize composable children for action driven dialogs', function () {
    expect(wire(Modal::make('settings.two-factor-setup')
        ->title('Set up two-factor authentication')
        ->description('Scan the QR code with your authenticator app.')
        ->schema([
            Text::make('Recovery codes will appear here.'),
        ])))
        ->toMatchArray([
            'type' => 'modal',
            'id' => 'settings.two-factor-setup',
            'props' => [
                'title' => 'Set up two-factor authentication',
                'description' => 'Scan the QR code with your authenticator app.',
                'closeLabel' => 'Close',
                'open' => null,
                'ref' => null,
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Recovery codes will appear here.',
                        'align' => null,
                    ],
                ],
            ],
        ]);
});

test('registered fragments serialize lazy endpoints and return component schemas', function () {
    Lattice::fragments([WorkbenchTwoFactorSetupFragment::class]);

    $fragment = wire(FragmentComponent::lazy(WorkbenchTwoFactorSetupFragment::class));
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

    getJson('/lattice/fragments/workbench.two-factor-setup', latticeHeaders('tampered'))
        ->assertForbidden();

    latticeGet('/lattice/fragments/workbench.two-factor-setup', $ref)
        ->assertOk()
        ->assertJsonPath('schema.0.type', 'text')
        ->assertJsonPath('schema.0.props.text', 'Authenticator setup loaded.');
});

test('links and horizontal stacks serialize as separate composable primitives', function () {
    expect(wire(Stack::make('prompt')->direction('row')->gap(Gap::ExtraSmall)->schema([
        Text::make('Need access?'),
        Link::make('Register')->href('/register'),
    ])))
        ->toMatchArray([
            'type' => 'stack',
            'key' => 'prompt',
            'props' => [
                'direction' => 'row',
                'gap' => 'xs',
                'align' => null,
                'width' => null,
                'justify' => null,
                'height' => null,
            ],
            'schema' => [
                [
                    'type' => 'text',
                    'props' => [
                        'text' => 'Need access?',
                        'align' => null,
                    ],
                ],
                [
                    'type' => 'link',
                    'props' => [
                        'href' => '/register',
                        'label' => 'Register',
                        'method' => null,
                        'tabIndex' => null,
                    ],
                ],
            ],
        ]);
});

test('layout enums serialize to their backed string values', function () {
    expect(wire(Stack::make('layout')
        ->align(Align::Center)
        ->gap(Gap::Large)
        ->width(Width::Small)))
        ->toMatchArray([
            'props' => [
                'align' => 'center',
                'gap' => 'lg',
                'width' => 'sm',
                'direction' => null,
                'justify' => null,
                'height' => null,
            ],
        ])
        ->and(wire(Text::make('Centered')->align(Align::Center))['props']['align'])
        ->toBe('center');
});

test('tabs serialize tab panels as composable children', function () {
    expect(wire(Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->schema([
            Tab::make('profile', 'Profile')->schema([
                Text::make('Profile form'),
            ]),
            Tab::make('security', 'Security')->schema([
                Form::make('password-form'),
            ]),
        ])))
        ->toMatchArray([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'activeValue' => 'security',
                'defaultValue' => 'security',
                'queryKey' => 'tabs',
                'orientation' => 'horizontal',
            ],
            'schema' => [
                [
                    'type' => 'tab',
                    'props' => [
                        'label' => 'Profile',
                        'value' => 'profile',
                        'confirm' => null,
                    ],
                    'schema' => [
                        [
                            'type' => 'text',
                            'props' => [
                                'text' => 'Profile form',
                                'align' => null,
                            ],
                        ],
                    ],
                ],
                [
                    'type' => 'tab',
                    'props' => [
                        'label' => 'Security',
                        'value' => 'security',
                        'confirm' => null,
                    ],
                    'schema' => [
                        [
                            'type' => 'form',
                            'id' => 'password-form',
                            'props' => [
                                'action' => null,
                                'method' => null,
                                'submitLabel' => null,
                                'validationSummaryLabel' => 'Fix these fields to continue:',
                                'precognitive' => null,
                                'validationTimeout' => null,
                                'submitButton' => null,
                                'resetOnSuccess' => null,
                                'resetOnError' => null,
                                'status' => null,
                                'errorBag' => null,
                                'state' => [],
                                'ref' => null,
                            ],
                        ],
                    ],
                ],
            ],
        ]);
});

test('tabs can customize their query string key', function () {
    expect(wire(Tabs::make('settings-tabs')
        ->queryKey('settings-tab')))
        ->toMatchArray([
            'type' => 'tabs',
            'key' => 'settings-tabs',
            'props' => [
                'activeValue' => '',
                'queryKey' => 'settings-tab',
                'orientation' => 'horizontal',
                'defaultValue' => null,
            ],
        ]);
});

test('tabs ignore hidden tab children when resolving their active value', function () {
    $tabs = wire(Tabs::make('settings-tabs')
        ->defaultValue('security')
        ->schema([
            Tab::make('profile', 'Profile'),
            Tab::make('security', 'Security')->when(false),
        ]));

    expect($tabs['props']['activeValue'])->toBe('profile')
        ->and($tabs['schema'])->toHaveCount(1)
        ->and($tabs['schema'][0]['props']['value'])->toBe('profile');
});

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

test('confirmed inactive tabs serialize only their tab metadata', function () {
    $tabs = wire(Tabs::make('settings-tabs')
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
        ]));

    expect($tabs['props']['activeValue'])->toBe('profile')
        ->and($tabs['props']['defaultValue'])->toBe('profile')
        ->and($tabs['props']['queryKey'])->toBe('tabs')
        ->and($tabs['schema'][0]['props']['value'])->toBe('profile')
        ->and($tabs['schema'][1]['props']['value'])->toBe('security')
        ->and($tabs['schema'][1]['props']['confirm'])->toMatchArray([
            'required' => true,
            'redirectUrl' => '/user/confirm-password',
        ])
        ->and($tabs['schema'][1])->not->toHaveKey('schema');
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

test('pages serialize layout and container metadata', function () {
    $defaultPage = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Default page'));
        }
    };

    $configuredPage = new #[\Lattice\Lattice\Attributes\Page(container: PageContainer::Default)] class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Configured page'));
        }
    };

    expect($defaultPage->toArray($defaultPage->render(PageSchema::make()), new Request))
        ->toMatchArray(['layout' => null, 'container' => 'centered'])
        ->and($configuredPage->toArray($configuredPage->render(PageSchema::make()), new Request))
        ->toMatchArray(['layout' => null, 'container' => 'default']);
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

    expect($page->toArray($page->render(PageSchema::make()), new Request))
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
            ->where('lattice.layout.key', 'app')
            ->where('lattice.layout.schema.0.type', 'stack')
            ->where('lattice.layout.schema.0.schema.1.schema.0.type', 'breadcrumbs')
            ->where('lattice.layout.schema.0.schema.1.schema.1.type', 'outlet')
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
            ->where('lattice.schema.0.schema.1.schema.0.props.title', 'Components'));
});

test('workbench tables page serializes lazy tables for each pagination type', function () {
    withoutVite();

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
            ->where('lattice.schema.0.schema.1.schema.0.schema.1.props.data', [])
            ->where('lattice.schema.0.schema.1.schema.0.schema.1.props.pagination.mode', 'none')
            ->where('lattice.schema.0.schema.1.schema.1.props.value', 'simple')
            ->where('lattice.schema.0.schema.1.schema.1.schema.1.id', 'workbench.users.simple')
            ->where('lattice.schema.0.schema.1.schema.1.schema.1.props.pagination.mode', 'simple')
            ->where('lattice.schema.0.schema.1.schema.2.props.value', 'table')
            ->where('lattice.schema.0.schema.1.schema.2.schema.1.id', 'workbench.users.table')
            ->where('lattice.schema.0.schema.1.schema.2.schema.1.props.pagination.mode', 'table')
            ->where('lattice.schema.0.schema.1.schema.3.props.value', 'infinite')
            ->where('lattice.schema.0.schema.1.schema.3.schema.1.id', 'workbench.users.infinite')
            ->where('lattice.schema.0.schema.1.schema.3.schema.1.props.pagination.mode', 'infinite'));
});

test('workbench user seeder creates sample table data idempotently', function () {
    app(UserSeeder::class)->run();
    app(UserSeeder::class)->run();

    expect(User::query()->count())->toBe(1000)
        ->and(User::query()->where('email', 'ada@example.com')->value('name'))->toBe('Ada Lovelace')
        ->and(User::query()->where('email', 'workbench-user-994@example.com')->exists())->toBeTrue()
        ->and(User::query()->distinct()->count('created_at'))->toBe(1000)
        ->and(User::query()->distinct()->count('updated_at'))->toBe(1000)
        ->and(User::query()->whereColumn('updated_at', '<', 'created_at')->doesntExist())->toBeTrue();
});

#[FormAttribute('settings.profile')]
class WorkbenchProfileForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form
            ->method(HttpMethod::Patch)
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

#[FormAttribute('workbench.request-aware')]
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

#[TableAttribute('workbench.users')]
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
                ->filterable(Op::Equals),
            TextColumn::make('email')
                ->label('Email')
                ->sortable(),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            [
                'name' => 'Taylor',
                'filters' => array_map(
                    fn ($filter): array => wire($filter),
                    $query->filters(),
                ),
                'sorts' => array_map(
                    fn ($sort): array => [
                        'key' => $sort->key,
                        'direction' => $sort->direction,
                    ],
                    $query->sorts(),
                ),
            ],
        ]));
    }
}

#[TableAttribute('workbench.lazy-users')]
class WorkbenchLazyUsersTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name'),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(function (TableQuery $query): TableResult {
            throw new RuntimeException('Lazy table query should not run during serialization.');
        });
    }
}

/**
 * @extends EloquentTableDefinition<User>
 *
 * @phpstan-extends EloquentTableDefinition<User>
 */
#[TableAttribute('workbench.infinite-users')]
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
#[TableAttribute('workbench.default-users')]
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
#[TableAttribute('workbench.simple-users')]
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
#[TableAttribute('workbench.small-users')]
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

#[TableAttribute('workbench.stacked-users')]
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

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            [
                'id' => 1,
                'name' => 'Taylor',
                'email' => 'taylor@example.com',
                'status' => 'Active',
            ],
        ]));
    }
}

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
            ->method(HttpMethod::Post)
            ->variant(ButtonVariant::Secondary)
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
            ->toast(ToastVariant::Info, 'Action handled.')
            ->reloadComponent('workbench.users');
    }
}

final class WorkbenchToastFactory
{
    use CreatesToastMessages;

    public static function flashToast(ToastVariant $variant, string $message): ResponseFactory
    {
        return (new self)->toast($variant, $message);
    }
}

#[Action('workbench.denied')]
final class WorkbenchDeniedAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Denied');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }

    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[FormAttribute('workbench.denied')]
final class WorkbenchDeniedForm extends FormDefinition
{
    public function definition(Form $form, Request $request): Form
    {
        return $form;
    }

    public function handle(Request $request): Response
    {
        return new Response;
    }

    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[TableAttribute('workbench.denied')]
final class WorkbenchDeniedTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([]));
    }

    public function authorize(Request $request): bool
    {
        return false;
    }
}

#[Fragment('workbench.denied')]
final class WorkbenchDeniedFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Denied fragment'));
    }

    public function authorize(Request $request): bool
    {
        return false;
    }
}
