<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Actions\ActionDefinition;
use Lattice\Lattice\Actions\ActionResult;
use Lattice\Lattice\Actions\BulkActionDefinition;
use Lattice\Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Lattice\Attributes\AsAction;
use Lattice\Lattice\Attributes\AsBulkAction;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Core\Services\ComponentReferenceSigner;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Tables\CallbackTableSource;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table as TableComponent;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\TableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;

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
        ]);
    }
}
