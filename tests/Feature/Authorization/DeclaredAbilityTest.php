<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Attributes\AsBulkAction;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Attributes\AsTable;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Http\Page;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table as TableComponent;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\Components\Heading;
use Lattice\Ui\PageSchema;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\patch;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    DeclaredAbilityAction::$authorized = true;

    Lattice::actions([
        DeclaredAbilityAction::class,
        DeclaredAbilityMultiAction::class,
        UndeclaredAbilityAction::class,
        MalformedAbilityAction::class,
    ]);
    Lattice::tables([DeclaredAbilityTable::class]);
    Lattice::bulkActions([DeclaredAbilityBulkAction::class]);

    Route::get('declared-ability-test', [DeclaredAbilityPage::class, 'render'])
        ->middleware('web')
        ->name('declared-ability-test.show');

    Route::get('declared-ability-page-test', [DeclaredAbilityAttributePage::class, 'render'])
        ->middleware('web')
        ->name('declared-ability-page-test.show');

    withoutVite();
});

function allowAbilities(string ...$abilities): void
{
    foreach (['manage-widgets', 'inspect-widgets'] as $ability) {
        Gate::define($ability, static fn (): bool => in_array($ability, $abilities, true));
    }

    actingAs(workbenchTestUser());
}

/**
 * @param  array<string, mixed>  $context
 */
function sealedRef(string $type, string $key, array $context = []): string
{
    return app(ComponentReferenceSigner::class)->seal($type, $key, $context);
}

test('a declared ability gates the endpoint', function (array $allowed, bool $expected): void {
    allowAbilities(...$allowed);

    $response = postJson(
        '/lattice/actions/declared.action',
        [],
        ['X-Lattice-Ref' => sealedRef('action', 'declared.action')],
    );

    $expected ? $response->assertOk() : $response->assertForbidden();
})->with([
    'denied' => [[], false],
    'allowed' => [['manage-widgets'], true],
]);

test('a declared ability hides the component at render time', function (): void {
    allowAbilities();

    $this->assertLatticePage(get('/declared-ability-test')->assertOk())
        ->assertNotRendered('action:declared.action');

    allowAbilities('manage-widgets');

    $this->assertLatticePage(get('/declared-ability-test')->assertOk())
        ->assertRendered('action:declared.action');
});

test('every declared ability must pass', function (array $allowed, bool $expected): void {
    allowAbilities(...$allowed);

    $response = postJson(
        '/lattice/actions/declared.multi-action',
        [],
        ['X-Lattice-Ref' => sealedRef('action', 'declared.multi-action')],
    );

    $expected ? $response->assertOk() : $response->assertForbidden();
})->with([
    'neither' => [[], false],
    'first only' => [['manage-widgets'], false],
    'second only' => [['inspect-widgets'], false],
    'both' => [['manage-widgets', 'inspect-widgets'], true],
]);

test('a definition declaring nothing stays open', function (): void {
    allowAbilities();

    postJson('/lattice/actions/undeclared.action', [], ['X-Lattice-Ref' => sealedRef('action', 'undeclared.action')])
        ->assertOk();
});

test('a malformed declaration fails closed', function (): void {
    allowAbilities('manage-widgets');

    postJson('/lattice/actions/malformed.action', [], ['X-Lattice-Ref' => sealedRef('action', 'malformed.action')])
        ->assertForbidden();
});

test('an authorize() override cannot widen a declared ability', function (): void {
    allowAbilities();
    DeclaredAbilityAction::$authorized = true;

    postJson('/lattice/actions/declared.action', [], ['X-Lattice-Ref' => sealedRef('action', 'declared.action')])
        ->assertForbidden();
});

test('an authorize() override still narrows a passing declared ability', function (): void {
    allowAbilities('manage-widgets');
    DeclaredAbilityAction::$authorized = false;

    postJson('/lattice/actions/declared.action', [], ['X-Lattice-Ref' => sealedRef('action', 'declared.action')])
        ->assertForbidden();
});

test('a declared ability gates the table endpoint', function (array $allowed, bool $expected): void {
    allowAbilities(...$allowed);

    $response = getJson('/lattice/tables/declared.table', ['X-Lattice-Ref' => sealedRef('table', 'declared.table')]);

    $expected ? $response->assertOk() : $response->assertForbidden();
})->with([
    'denied' => [[], false],
    'allowed' => [['manage-widgets'], true],
]);

test('a bulk action inherits its table\'s declared ability', function (): void {
    allowAbilities();

    patch(
        '/lattice/bulk-actions/declared.bulk-action',
        [],
        ['X-Lattice-Ref' => sealedRef('action.bulk', 'declared.bulk-action', ['table' => 'declared.table'])],
    )->assertForbidden();
});

test('a declared ability on the page attribute gates the page', function (array $allowed, bool $expected): void {
    allowAbilities(...$allowed);

    $response = get('/declared-ability-page-test');

    $expected ? $response->assertOk() : $response->assertForbidden();
})->with([
    'denied' => [[], false],
    'allowed' => [['manage-widgets'], true],
]);

test('an authorize() override cannot widen a page\'s declared ability', function (): void {
    allowAbilities();

    get('/declared-ability-page-test')->assertForbidden();
});

test('a declared ability on a component drops it from the payload', function (): void {
    allowAbilities();

    $this->assertLatticePage(get('/declared-ability-test')->assertOk())
        ->assertNotRendered('heading:gated-heading');

    allowAbilities('inspect-widgets');

    $this->assertLatticePage(get('/declared-ability-test')->assertOk())
        ->assertRendered('heading:gated-heading');
});

test('visible() cannot widen a component\'s declared ability', function (): void {
    allowAbilities();

    expect(Heading::make('x')->can('manage-widgets')->visible(true)->shouldRender())->toBeFalse();
});

#[AsPage(can: 'manage-widgets')]
final class DeclaredAbilityAttributePage extends Page
{
    public function title(): string
    {
        return 'Declared ability page';
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return true;
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([]);
    }
}

test('the test helpers reach a can-gated definition', function (): void {
    allowAbilities('manage-widgets');

    $this->loadTable(DeclaredAbilityTable::class)->assertOk();
    $this->callAction(DeclaredAbilityAction::class)->assertOk();
});

test('the test helpers still refuse a denied can-gated definition', function (): void {
    allowAbilities();

    $this->loadDeniedTable(DeclaredAbilityTable::class)->assertForbidden();
});

#[AsAction('declared.action', can: 'manage-widgets')]
final class DeclaredAbilityAction extends ActionDefinition
{
    public static bool $authorized = true;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Declared action');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return self::$authorized;
    }
}

#[AsAction('declared.multi-action', can: ['manage-widgets', 'inspect-widgets'])]
final class DeclaredAbilityMultiAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Multi declared action');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }
}

#[AsAction('undeclared.action')]
final class UndeclaredAbilityAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Undeclared action');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }
}

#[AsAction('malformed.action', can: '')]
final class MalformedAbilityAction extends ActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Malformed action');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }
}

#[AsTable('declared.table', can: 'manage-widgets')]
final class DeclaredAbilityTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(
            static fn (TableQuery $query): TableResult => TableResult::fromItems([['id' => 1, 'name' => 'Widget']]),
        );
    }
}

#[AsBulkAction('declared.bulk-action')]
final class DeclaredAbilityBulkAction extends BulkActionDefinition
{
    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Declared bulk action');
    }

    /**
     * @param  Collection<int, mixed>  $records
     */
    public function handle(Collection $records, Request $request): ActionResult
    {
        return ActionResult::success();
    }
}

final class DeclaredAbilityPage extends Page
{
    public function title(): string
    {
        return 'Declared ability';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            ActionComponent::use(DeclaredAbilityAction::class),
            TableComponent::use(DeclaredAbilityTable::class),
            Heading::make('Gated heading')->key('gated-heading')->can('inspect-widgets'),
        ]);
    }
}
