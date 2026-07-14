<?php
declare(strict_types=1);

use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tables\Components\Table;
use Workbench\App\Fragments\SalesOrderLinesFragment;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\User;
use Workbench\App\Tables\SalesOrdersTable;
use Workbench\App\Tables\UsersTable;

/**
 * @return array<int, array<string, mixed>>
 */
function salesOrdersTableRows(): array
{
    Lattice::tables([SalesOrdersTable::class]);
    Lattice::fragments([SalesOrderLinesFragment::class]);

    return wire(Table::use(SalesOrdersTable::class))['props']['data'];
}

it('attaches a lazy detail fragment node to each row', function (): void {
    $partner = BusinessPartner::factory()->create();
    SalesOrder::factory()->create(['business_partner_id' => $partner->getKey(), 'number' => 'SO-1']);

    $rows = salesOrdersTableRows();

    expect($rows)->toHaveCount(1)
        ->and($rows[0])->toHaveKey('detail')
        ->and($rows[0]['detail']['type'])->toBe('fragment')
        ->and($rows[0]['detail']['props']['lazy'])->toBeTrue()
        ->and($rows[0]['detail']['props']['endpoint'])->not->toBeNull();
});

it('omits detail when a table declares no row detail', function (): void {
    Lattice::tables([UsersTable::class]);
    User::query()->forceCreate([
        'name' => 'Ada', 'email' => 'ada@example.com', 'password' => bcrypt('secret'),
    ]);

    $rows = wire(Table::use(UsersTable::class))['props']['data'];

    expect($rows[0])->not->toHaveKey('detail');
});

it('renders the order line items in the detail fragment', function (): void {
    $partner = BusinessPartner::factory()->create();
    $product = Product::factory()->create(['name' => 'Widget']);
    $order = SalesOrder::factory()->create(['business_partner_id' => $partner->getKey()]);
    $order->lines()->create(['product_id' => $product->getKey(), 'quantity' => 3, 'unit_price' => '10.00']);

    $fragment = (new SalesOrderLinesFragment)->withContext(['orderId' => $order->getKey()]);
    $json = json_encode($fragment->schema(PageSchema::make())->renderable(), JSON_UNESCAPED_UNICODE);

    expect($json)->toContain('3 × Widget — 30.00');
});
