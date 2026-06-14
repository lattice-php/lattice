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
    File::replace($file, "<?php\ndeclare(strict_types=1);\n\nreturn ".var_export($translations, true).";\n", 0644);
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
    $this->actingAs(workbenchTestUser());
    $file = package_path('lang/en/lattice.php');
    $original = File::get($file);
    $translations = require $file;

    Arr::forget($translations, 'editor.italic');
    writeLatticeBrowserTestTranslations($file, $translations);

    $page = visit('/dependent-demo');

    try {
        $page->assertSee('Article')
            ->assertPresent('[aria-label="Italic"]')
            ->assertNoJavaScriptErrors();

        expect(waitForLatticeBrowserTestTranslation($file, 'editor.italic'))
            ->toBe('i18next-editor.italic')
            ->and(File::exists(package_path('workbench/lang/en/language.php')))->toBeFalse()
            ->and(File::exists(package_path('workbench/lang/en/status.php')))->toBeFalse();
    } finally {
        try {
            $page->script('window.location.assign("/")');
            $page->wait(0.5);
        } finally {
            File::replace($file, $original, 0644);
        }
    }
});
