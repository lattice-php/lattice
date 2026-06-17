<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Tables\SalesOrdersTable;

/**
 * @param  array<string, string>  $params
 * @return array<int, array<string, mixed>>
 */
function salesOrderRows(array $params = []): array
{
    $table = new SalesOrdersTable;

    $query = TableQuery::fromRequest(
        Request::create('/', 'GET', $params),
        $table->columns(),
        'workbench.sales-orders',
    );

    return $table->source()->query($query)->jsonSerialize()['data'];
}

test('a relation column eager-loads its value onto a flat key without N+1', function (): void {
    $acme = BusinessPartner::factory()->create(['name' => 'Acme']);
    $globex = BusinessPartner::factory()->create(['name' => 'Globex']);
    SalesOrder::factory()->count(3)->create(['business_partner_id' => $acme->getKey()]);
    SalesOrder::factory()->count(2)->create(['business_partner_id' => $globex->getKey()]);

    DB::flushQueryLog();
    DB::enableQueryLog();

    $rows = salesOrderRows();

    expect($rows)->toHaveCount(5)
        ->and($rows[0])->toHaveKey('businessPartner.name')
        ->and($rows[0])->not->toHaveKey('business_partner');

    // One query loads every partner, regardless of row count — no N+1.
    $partnerQueries = collect(DB::getQueryLog())
        ->filter(fn (array $log): bool => str_contains((string) $log['query'], 'business_partners'))
        ->count();

    expect($partnerQueries)->toBe(1);
});

test('a relation column filters through whereHas', function (): void {
    $acme = BusinessPartner::factory()->create(['name' => 'Acme']);
    $globex = BusinessPartner::factory()->create(['name' => 'Globex']);
    SalesOrder::factory()->create(['business_partner_id' => $acme->getKey(), 'number' => 'SO-A']);
    SalesOrder::factory()->create(['business_partner_id' => $globex->getKey(), 'number' => 'SO-G']);

    $rows = salesOrderRows(['filter' => 'businessPartner.name:contains:Acme']);

    expect($rows)->toHaveCount(1)
        ->and($rows[0]['number'])->toBe('SO-A')
        ->and($rows[0]['businessPartner.name'])->toBe('Acme');
});

test('a relation column sorts through a correlated subquery', function (): void {
    $acme = BusinessPartner::factory()->create(['name' => 'Acme']);
    $globex = BusinessPartner::factory()->create(['name' => 'Globex']);
    SalesOrder::factory()->create(['business_partner_id' => $acme->getKey(), 'number' => 'SO-A']);
    SalesOrder::factory()->create(['business_partner_id' => $globex->getKey(), 'number' => 'SO-G']);

    $rows = salesOrderRows(['sort' => '-businessPartner.name']);

    expect(array_column($rows, 'number'))->toBe(['SO-G', 'SO-A']);
});
