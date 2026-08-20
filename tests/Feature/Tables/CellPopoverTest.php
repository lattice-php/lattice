<?php
declare(strict_types=1);

use Lattice\Core\Attributes\AsFragment;
use Lattice\Core\Facades\Lattice;
use Lattice\Fragments\Components\Fragment;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

beforeEach(function (): void {
    Lattice::tables([CellPopoverTable::class]);
    Lattice::fragments([CustomerCardFragment::class]);
});

it('attaches a lazy popover fragment node keyed by column for each row that resolves one', function (): void {
    $rows = wire(Table::use(CellPopoverTable::class))['props']['data'];

    expect($rows)->toHaveCount(2);

    $withCard = $rows[0];
    expect($withCard['id'])->toBe(1)
        ->and($withCard)->toHaveKey('popovers')
        ->and($withCard['popovers']['customer_name']['type'])->toBe('fragment')
        ->and($withCard['popovers']['customer_name']['props']['lazy'])->toBeTrue()
        ->and($withCard['popovers']['customer_name']['props']['endpoint'])->not->toBeNull();
});

it('omits the popovers key for a row whose popover closure returns null', function (): void {
    $rows = wire(Table::use(CellPopoverTable::class))['props']['data'];

    $withoutCard = $rows[1];
    expect($withoutCard['id'])->toBe(2)
        ->and($withoutCard)->not->toHaveKey('popovers');
});

#[AsTable('cell-popover.table')]
final class CellPopoverTable extends TableDefinition
{
    public function columns(): array
    {
        return [
            TextColumn::make('customer_name')
                ->popover(fn (array $row): ?Fragment => $row['has_card']
                    ? Fragment::lazy(CustomerCardFragment::class, ['customerId' => $row['id']])
                    : null),
        ];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([
            ['id' => 1, 'customer_name' => 'Ada Lovelace', 'has_card' => true],
            ['id' => 2, 'customer_name' => 'Grace Hopper', 'has_card' => false],
        ]));
    }
}

#[AsFragment('cell-popover.customer-card')]
final class CustomerCardFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Customer #'.$this->contextIntOrNull('customerId')));
    }
}
