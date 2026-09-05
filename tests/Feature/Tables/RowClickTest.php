<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\ActionResult;
use Lattice\Actions\Components\Action as ActionComponent;
use Lattice\Core\Attributes\AsAction;
use Lattice\Core\Facades\Lattice;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\RowClick;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\Components\Modal;
use Lattice\Ui\Components\Text;

use function Pest\Laravel\postJson;

beforeEach(function (): void {
    RowClickArchiveAction::$archived = [];
    RowClickArchiveAction::$authorized = true;

    Lattice::tables([RowClickTable::class]);
    Lattice::actions([RowClickArchiveAction::class]);
});

/**
 * @return array<int, array<string, mixed>>
 */
function rowClickRows(): array
{
    return wire(Table::use(RowClickTable::class))['props']['data'];
}

it('attaches the action a row click runs to the row', function (): void {
    $rows = rowClickRows();

    expect($rows[0]['rowClick']['type'])->toBe('table.row-click')
        ->and($rows[0]['rowClick']['props']['action']['id'])->toBe('row-click.archive')
        ->and($rows[0]['rowClick']['props']['href'])->toBeNull();
});

it('runs the row click action through its sealed reference', function (): void {
    $rows = rowClickRows();

    postJson('/lattice/actions/row-click.archive', [], [
        'X-Lattice-Ref' => $rows[0]['rowClick']['props']['action']['props']['ref'],
    ])->assertOk();

    expect(RowClickArchiveAction::$archived)->toBe([1]);
});

it('leaves a row unclickable when its action is unauthorized', function (): void {
    RowClickArchiveAction::$authorized = false;

    expect(rowClickRows()[0])->not->toHaveKey('rowClick');
});

it('attaches the modal a row click opens to the row', function (): void {
    $rows = rowClickRows();

    expect($rows[1]['rowClick']['props']['modal']['props']['title'])->toBe('Shelf');
});

it('leaves a row unclickable when it declares no click', function (): void {
    expect(rowClickRows()[2])->not->toHaveKey('rowClick');
});

#[AsTable('row-click.table')]
final class RowClickTable extends TableDefinition
{
    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            ['id' => 1, 'name' => 'Lamp'],
            ['id' => 2, 'name' => 'Shelf'],
            ['id' => 3, 'name' => 'Rug'],
        ]));
    }

    #[Override]
    public function rowClick(array $row): ?RowClick
    {
        if ($row['id'] === 1) {
            return RowClick::make()->action(RowClickArchiveAction::class, ['product' => $row['id']]);
        }

        if ($row['id'] === 3) {
            return null;
        }

        return RowClick::make()->modal(fn (): Modal => Modal::make('row-click-modal')
            ->title($row['name'])
            ->schema([Text::make('Details')]));
    }
}

#[AsAction('row-click.archive')]
final class RowClickArchiveAction extends ActionDefinition
{
    /** @var array<int, mixed> */
    public static array $archived = [];

    public static bool $authorized = true;

    public function definition(ActionComponent $action): ActionComponent
    {
        return $action->label('Archive');
    }

    public function handle(Request $request): ActionResult
    {
        self::$archived[] = $this->context('product');

        return ActionResult::success();
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        return self::$authorized;
    }
}
