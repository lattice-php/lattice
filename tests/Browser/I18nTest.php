<?php
declare(strict_types=1);

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use function Orchestra\Testbench\package_path;

/**
 * @param  array<string, mixed>  $translations
 */
function writeLatticeBrowserTestTranslations(string $file, array $translations): void
{
    File::put($file, "<?php\ndeclare(strict_types=1);\n\nreturn ".var_export($translations, true).";\n");
}

function waitForLatticeBrowserTestTranslation(string $file, string $key): mixed
{
    $deadline = microtime(true) + 5;

    do {
        clearstatcache(true, $file);

        $translations = require $file;
        $value = data_get($translations, $key);

        if ($value !== null) {
            return $value;
        }

        usleep(100_000);
    } while (microtime(true) < $deadline);

    return data_get(require $file, $key);
}

it('dumps missing React lattice keys back into the package lang file', function (): void {
    $file = package_path('lang/en/lattice.php');
    $original = File::get($file);
    $translations = require $file;

    Arr::forget($translations, 'editor.bold');
    writeLatticeBrowserTestTranslations($file, $translations);

    try {
        visit('/dependent-demo')
            ->assertSee('Article')
            ->assertPresent('[aria-label="Bold"]')
            ->assertNoJavaScriptErrors();

        expect(waitForLatticeBrowserTestTranslation($file, 'editor.bold'))
            ->toBe('i18next-editor.bold')
            ->and(File::exists(package_path('workbench/lang/en/language.php')))->toBeFalse()
            ->and(File::exists(package_path('workbench/lang/en/status.php')))->toBeFalse();
    } finally {
        File::put($file, $original);
    }
});
