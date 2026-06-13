<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

beforeEach(function () {
    File::ensureDirectoryExists(resource_path('js/lattice'));
    File::put(resource_path('js/lattice/columns.ts'),
        "import { createPlugin } from \"@lattice-php/lattice\";\n\nexport const appColumns = createPlugin({\n  name: \"app\",\n  columns: {},\n});\n");
});

afterEach(function () {
    File::deleteDirectory(app_path('Tables'));
    File::deleteDirectory(resource_path('js/lattice'));
});

it('scaffolds a column class, a cell tsx and registers it in columns.ts', function () {
    artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();

    $columnFile = app_path('Tables/Columns/StatusBadge.php');
    expect(File::get($columnFile))
        ->toContain('namespace App\\Tables\\Columns;')
        ->toContain('Attributes\\Column(')
        ->toContain('StatusBadgeProps::class')
        ->toContain('class StatusBadge extends Column')
        ->toContain('public function toData(): ColumnData');

    $propsFile = app_path('Tables/Columns/StatusBadgeProps.php');
    expect(File::exists($propsFile))->toBeTrue()
        ->and(File::get($propsFile))->toContain('implements ColumnProps');

    expect(File::get(resource_path('js/lattice/columns/status-badge.tsx')))
        ->toContain('ColumnCellComponent')
        ->toContain('StatusBadgeCell');

    $columns = File::get(resource_path('js/lattice/columns.ts'));
    expect($columns)
        ->toContain('import { StatusBadgeCell } from "./columns/status-badge";')
        ->toContain('"column.status-badge": StatusBadgeCell');
});

it('is idempotent and honors --type', function () {
    artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();
    artisan('lattice:column', ['name' => 'StatusBadge'])->assertSuccessful();
    expect(substr_count(File::get(resource_path('js/lattice/columns.ts')), '"column.status-badge": StatusBadgeCell'))->toBe(1);

    artisan('lattice:column', ['name' => 'Priority', '--type' => 'column.prio'])->assertSuccessful();
    expect(File::get(app_path('Tables/Columns/Priority.php')))->toContain("Attributes\\Column(type: 'column.prio'");
});
