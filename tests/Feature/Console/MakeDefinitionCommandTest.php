<?php
declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Pest\Laravel\artisan;

it('scaffolds each definition type into its app directory', function (string $command, string $dir, string $base): void {
    withScaffoldWorkspace(function () use ($command, $dir, $base): void {
        artisan($command, ['name' => 'Example'])->assertSuccessful();

        expect(File::get(app_path($dir.'/Example.php')))
            ->toContain('namespace App\\'.str_replace('/', '\\', $dir).';')
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

it('supports nested names', function (): void {
    withScaffoldWorkspace(function (): void {
        artisan('lattice:form', ['name' => 'Settings/ProfileForm'])->assertSuccessful();

        expect(File::get(app_path('Forms/Settings/ProfileForm.php')))
            ->toContain('namespace App\\Forms\\Settings;')
            ->toContain('class ProfileForm extends FormDefinition');
    });
});

it('skips an existing definition without --force and overwrites with it', function (): void {
    withScaffoldWorkspace(function (): void {
        artisan('lattice:page', ['name' => 'Home'])->assertSuccessful();
        File::put(app_path('Pages/Home.php'), '<?php // stale');

        artisan('lattice:page', ['name' => 'Home'])->assertFailed();
        expect(File::get(app_path('Pages/Home.php')))->toBe('<?php // stale');

        artisan('lattice:page', ['name' => 'Home', '--force' => true])->assertSuccessful();
        expect(File::get(app_path('Pages/Home.php')))->toContain('class Home extends Page');
    });
});
