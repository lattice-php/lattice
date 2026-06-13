<?php
declare(strict_types=1);

/**
 * Locks the committed generated module to the wire value objects it must expose.
 * The GeneratedTypesSnapshotTest separately guarantees this file stays in sync
 * with `lattice:typescript`; here we assert the concrete shapes the client relies on.
 */
function generatedModule(): string
{
    return (string) file_get_contents(dirname(__DIR__, 3).'/resources/js/types/generated.ts');
}

it('generates the ActionResult wire shape', function () {
    expect(generatedModule())
        ->toContain('export type ActionResult = {')
        ->toMatch('/export type ActionResult = \{\s*readonly ok: boolean;\s*readonly data: Record<string, unknown>;\s*readonly effects: Effect\[\];\s*\};/');
});

it('generates the TableQuery wire shape', function () {
    expect(generatedModule())
        ->toContain('export type TableQuery = {')
        ->toMatch('/export type TableQuery = \{\s*readonly filters: FilterClause\[\];\s*readonly sorts: TableSort\[\];\s*readonly page: number;\s*readonly perPage: number;\s*\};/');
});

it('generates the flat TablePagination wire shape', function () {
    expect(generatedModule())
        ->toContain('export type TablePagination = {')
        ->toMatch('/export type TablePagination = \{\s*readonly mode: PaginationType;\s*readonly currentPage: number \| null;\s*readonly lastPage: number \| null;\s*readonly perPage: number \| null;\s*readonly total: number \| null;\s*readonly from: number \| null;\s*readonly to: number \| null;\s*readonly hasMore: boolean;\s*readonly nextPage: number \| null;\s*\};/');
});

it('generates the I18nConfig wire shape', function () {
    expect(generatedModule())
        ->toContain('export type I18nConfig = {')
        ->toMatch('/export type I18nConfig = \{\s*readonly enabled: boolean;\s*readonly saveMissing: boolean;\s*\};/');
});
