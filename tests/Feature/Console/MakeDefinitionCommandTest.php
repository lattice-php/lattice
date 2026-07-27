<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

it('scaffolds each definition type into the default Ui layer', function (string $command, string $dir, string $base): void {
    withScaffoldWorkspace(function () use ($command, $dir, $base): void {
        artisan($command, ['name' => 'Example'])->assertSuccessful();

        expect(File::get(app_path('Ui/'.$dir.'/Example.php')))
            ->toContain('namespace App\\Ui\\'.str_replace('/', '\\', $dir).';')
            ->toContain('class Example extends '.$base);
    });
})->with([
    'page' => ['lattice:page', 'Pages', 'Page'],
    'form' => ['lattice:form', 'Forms', 'FormDefinition'],
    'table' => ['lattice:table', 'Tables', 'EloquentTableDefinition'],
    'action' => ['lattice:action', 'Actions', 'ActionDefinition'],
    'bulk-action' => ['lattice:bulk-action', 'Actions', 'BulkActionDefinition'],
    'fragment' => ['lattice:fragment', 'Fragments', 'FragmentDefinition'],
    'layout' => ['lattice:layout', 'Layouts', 'LayoutDefinition'],
    'remote-source' => ['lattice:remote-source', 'Remote', 'RemoteSourceDefinition'],
]);

it('treats a name with a separator as an explicit path under App', function (): void {
    withScaffoldWorkspace(function (): void {
        artisan('lattice:form', ['name' => 'Projects/Ui/Forms/ProfileForm'])->assertSuccessful();

        expect(File::get(app_path('Projects/Ui/Forms/ProfileForm.php')))
            ->toContain('namespace App\\Projects\\Ui\\Forms;')
            ->toContain('class ProfileForm extends FormDefinition');
    });
});

it('treats a backslash name identically to a slash name', function (): void {
    withScaffoldWorkspace(function (): void {
        artisan('lattice:table', ['name' => 'Billing\\Ui\\Tables\\TransactionsTable'])->assertSuccessful();

        expect(File::get(app_path('Billing/Ui/Tables/TransactionsTable.php')))
            ->toContain('namespace App\\Billing\\Ui\\Tables;')
            ->toContain('class TransactionsTable extends EloquentTableDefinition');
    });
});

it('skips an existing definition without --force and overwrites with it', function (): void {
    withScaffoldWorkspace(function (): void {
        artisan('lattice:page', ['name' => 'Home'])->assertSuccessful();
        File::put(app_path('Ui/Pages/Home.php'), '<?php // stale');

        artisan('lattice:page', ['name' => 'Home'])->assertFailed();
        expect(File::get(app_path('Ui/Pages/Home.php')))->toBe('<?php // stale');

        artisan('lattice:page', ['name' => 'Home', '--force' => true])->assertSuccessful();
        expect(File::get(app_path('Ui/Pages/Home.php')))->toContain('class Home extends Page');
    });
});
