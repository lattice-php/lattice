<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

function withColumnScaffold(Closure $callback): mixed
{
    return withScaffoldWorkspace(function () use ($callback): mixed {
        File::put(resource_path('js/registry.ts'), latticeRegistryStub());

        return $callback();
    });
}

it('scaffolds a column class, a cell tsx and registers it in registry.ts', function (): void {
    withColumnScaffold(function (): void {
        artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();

        $columnFile = app_path('Tables/Columns/StatusBadge.php');
        expect(File::get($columnFile))
            ->toContain('namespace App\\Tables\\Columns;')
            ->toContain("#[AsColumn(type: 'status-badge')]")
            ->toContain('class StatusBadge extends Column')
            ->not->toContain('toData')
            ->not->toContain('Props');

        expect(File::exists(app_path('Tables/Columns/StatusBadgeProps.php')))->toBeFalse();

        expect(File::get(resource_path('js/columns/status-badge.tsx')))
            ->toContain('ColumnCellComponent')
            ->toContain('StatusBadgeCell');

        $columns = File::get(resource_path('js/registry.ts'));
        expect($columns)
            ->toContain('import { StatusBadgeCell } from "./columns/status-badge";')
            ->toContain('"column.status-badge": StatusBadgeCell');
    });
});

it('is idempotent and honors --type', function (): void {
    withColumnScaffold(function (): void {
        artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();
        artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();
        expect(substr_count(File::get(resource_path('js/registry.ts')), '"column.status-badge": StatusBadgeCell'))->toBe(1);

        artisan('lattice:column', ['name' => 'Priority', '--type' => 'prio'])->assertSuccessful();
        expect(File::get(app_path('Tables/Columns/Priority.php')))->toContain("#[AsColumn(type: 'prio')]");
        expect(File::get(resource_path('js/registry.ts')))->toContain('"column.prio": PriorityCell');
    });
});
