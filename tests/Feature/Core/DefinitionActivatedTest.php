<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Facades\Lattice;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableQuery;
use Workbench\App\Models\Product;

#[AsAction('core.activated')]
final class ActivationRecordingAction extends ActionDefinition
{
    /** @var array<int, string> */
    public static array $activations = [];

    public function definition(Action $action): Action
    {
        return $action->label('Archive');
    }

    #[Override]
    public function activated(Request $request): void
    {
        self::$activations[] = $this->contextString('record');
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success()->toast('Archived '.$this->contextString('record'));
    }
}

afterEach(function (): void {
    Product::clearBootedModels();
});

beforeEach(function (): void {
    ActivationRecordingAction::$activations = [];
    DeniedActivationAction::$activations = [];
    Lattice::actions([ActivationRecordingAction::class, DeniedActivationAction::class]);
});

it('activates the addressed definition once, with its trusted context', function (): void {
    $this->callAction(ActivationRecordingAction::class, context: ['record' => 'r-1'])->assertOk();

    expect(ActivationRecordingAction::$activations)->toBe(['r-1']);
});

it('does not activate a definition that is merely being built', function (): void {
    Action::use(ActivationRecordingAction::class, ['record' => 'r-1']);
    Action::use(ActivationRecordingAction::class, ['record' => 'r-2']);

    expect(ActivationRecordingAction::$activations)->toBe([]);
});

it('does not activate a definition whose gate denied it', function (): void {
    $this->callDeniedAction(DeniedActivationAction::class, context: ['record' => 'r-1'])->assertForbidden();

    expect(DeniedActivationAction::$activations)->toBe([]);
});

it('activates a table before its deferred builder query runs', function (): void {
    // A global scope is applied when the query executes, which is after
    // builder() has returned — the seam the app-side workaround exists for.
    Product::addGlobalScope('activated', function (Builder $query): void {
        $query->where('name', Context::get('activated.name'));
    });

    Lattice::tables(ActivationScopedProductsTable::class);
    Product::factory()->create(['name' => 'Desk Lamp']);
    Product::factory()->create(['name' => 'Office Chair']);

    $rows = $this->loadTable(ActivationScopedProductsTable::class, context: ['record' => 'Desk Lamp'])
        ->assertOk()
        ->collect('data')
        ->pluck('name')
        ->all();

    expect($rows)->toBe(['Desk Lamp']);
});

/**
 * The builder is executed after builder() returns, so a scope keyed to the
 * activated context only applies if activated() set it request-wide.
 *
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('core.activated.products')]
final class ActivationScopedProductsTable extends EloquentTableDefinition
{
    #[Override]
    public function activated(Request $request): void
    {
        Context::add('activated.name', $this->contextString('record'));
    }

    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    /** @return Builder<Product> */
    public function builder(TableQuery $query): Builder
    {
        return Product::query();
    }
}

#[AsAction('core.activated.denied')]
final class DeniedActivationAction extends ActionDefinition
{
    /** @var array<int, string> */
    public static array $activations = [];

    public function definition(Action $action): Action
    {
        return $action->label('Archive');
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return false;
    }

    #[Override]
    public function activated(Request $request): void
    {
        self::$activations[] = 'called';
    }

    public function handle(Request $request): ActionResult
    {
        return ActionResult::success();
    }
}
