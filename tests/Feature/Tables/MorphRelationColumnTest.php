<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Lattice\Table\TableQuery;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Tables\MorphRelationColumnsTable;

/**
 * @param  array<string, string>  $params
 * @return array<int, array<string, mixed>>
 */
function morphRelationRows(array $params = []): array
{
    $table = new MorphRelationColumnsTable;

    $query = TableQuery::fromRequest(
        Request::create('/', 'GET', $params),
        $table->columns(),
        'workbench.morph-relation-columns',
    );

    return $table->source()->query($query)->data;
}

test('a MorphOne relation column eager-loads its value onto a flat key without N+1', function (): void {
    $acme = BusinessPartner::factory()->create(['name' => 'Acme']);
    $globex = BusinessPartner::factory()->create(['name' => 'Globex']);
    $acme->internalNote()->create(['type' => 'internal', 'body' => 'Acme internal note']);
    $globex->internalNote()->create(['type' => 'internal', 'body' => 'Globex internal note']);

    DB::flushQueryLog();
    DB::enableQueryLog();

    $rows = morphRelationRows();

    expect($rows)->toHaveCount(2)
        ->and($rows[0])->toHaveKey('internalNote.body')
        ->and($rows[0])->not->toHaveKey('internalNote');

    // The table also has a `notes` MultipleRelationColumn, so 2 partners produce
    // 2 total note queries — one per relation column, not one per row of either.
    $noteQueries = collect(DB::getQueryLog())
        ->filter(fn (array $log): bool => str_contains((string) $log['query'], 'notes'))
        ->count();

    expect($noteQueries)->toBe(2);
});

test('a MorphOne relation column filters through whereHas honouring both the morph type and the extra where', function (): void {
    $acme = BusinessPartner::factory()->create(['name' => 'Acme']);
    $globex = BusinessPartner::factory()->create(['name' => 'Globex']);
    $acme->internalNote()->create(['type' => 'internal', 'body' => 'needs follow-up']);
    $globex->notes()->create(['type' => 'external', 'body' => 'needs follow-up']);

    $rows = morphRelationRows(['filter' => 'internalNote.body:contains:follow-up']);

    // Globex's matching note is type=external, outside internalNote()'s scope — it must not match.
    expect($rows)->toHaveCount(1)
        ->and($rows[0]['name'])->toBe('Acme');
});

test('a MorphOne relation column sorts through a correlated subquery that preserves the extra where', function (): void {
    $acme = BusinessPartner::factory()->create(['name' => 'Acme']);
    $globex = BusinessPartner::factory()->create(['name' => 'Globex']);

    // Acme's internal note sorts last alphabetically; its external note (out of
    // internalNote()'s scope) would sort first if the extra where were dropped.
    $acme->internalNote()->create(['type' => 'internal', 'body' => 'zzz-internal']);
    $acme->notes()->create(['type' => 'external', 'body' => 'aaa-external']);
    $globex->internalNote()->create(['type' => 'internal', 'body' => 'mmm-internal']);

    $rows = morphRelationRows(['sort' => 'internalNote.body']);

    expect(array_column($rows, 'name'))->toBe(['Globex', 'Acme']);
});

test('a MorphMany relation column lists every related row without N+1', function (): void {
    $acme = BusinessPartner::factory()->create(['name' => 'Acme']);
    $acme->notes()->create(['type' => 'internal', 'body' => 'first']);
    $acme->notes()->create(['type' => 'external', 'body' => 'second']);
    BusinessPartner::factory()->create(['name' => 'Globex']);

    $rows = morphRelationRows();
    $acmeRow = collect($rows)->firstWhere('name', 'Acme');

    expect($acmeRow['notes'])->toBe(['first', 'second']);
});
