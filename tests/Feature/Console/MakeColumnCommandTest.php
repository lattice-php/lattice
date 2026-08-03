<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

use function Pest\Laravel\artisan;

it('scaffolds a column class, a cell tsx and registers it in registry.ts', function (): void {
    withRegistryScaffold(function (): void {
        artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();

        $columnFile = app_path('Ui/Tables/Columns/StatusBadge.php');
        expect(File::get($columnFile))
            ->toContain('namespace App\\Ui\\Tables\\Columns;')
            ->toContain("#[AsColumn(type: 'status-badge')]")
            ->toContain('class StatusBadge extends Column')
            ->not->toContain('toData')
            ->not->toContain('Props');

        expect(File::exists(app_path('Ui/Tables/Columns/StatusBadgeProps.php')))->toBeFalse();

        expect(File::get(resource_path('js/columns/status-badge.tsx')))
            ->toContain('ColumnCellComponent')
            ->toContain('StatusBadgeCell');

        $columns = File::get(resource_path('js/registry.ts'));
        expect($columns)
            ->toContain('import { StatusBadgeCell } from "./columns/status-badge";')
            ->toContain('"table.columns": {')
            ->toContain('"column.status-badge": StatusBadgeCell');
    });
});

it('is idempotent and honors --type', function (): void {
    withRegistryScaffold(function (): void {
        artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();
        artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();
        expect(substr_count(File::get(resource_path('js/registry.ts')), '"column.status-badge": StatusBadgeCell'))->toBe(1);

        artisan('lattice:column', ['name' => 'Priority', '--type' => 'prio'])->assertSuccessful();
        expect(File::get(app_path('Ui/Tables/Columns/Priority.php')))->toContain("#[AsColumn(type: 'prio')]");
        expect(File::get(resource_path('js/registry.ts')))->toContain('"column.prio": PriorityCell');
    });
});

it('registers a column in a Composer package plugin', function (): void {
    $dir = sys_get_temp_dir().'/lattice-column-pkg-'.Str::random(8);

    try {
        artisan('lattice:column', ['name' => 'StatusBadge', '--package' => $dir])->assertSuccessful();

        expect(File::get($dir.'/resources/js/plugin.ts'))
            ->toContain('"table.columns": {')
            ->toContain('"column.status-badge": StatusBadgeCell');
    } finally {
        File::deleteDirectory($dir);
    }
});
