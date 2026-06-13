<?php
declare(strict_types=1);

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

use function Orchestra\Testbench\package_path;
use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutVite;

afterEach(function () {
    File::deleteDirectory(package_path('lang/zz'));
    File::deleteDirectory(package_path('workbench/lang/zz'));
    File::delete(package_path('lang/zz.json'));
});

it('shares the i18n config to the frontend', function () {
    withoutVite();

    get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('lattice.i18n.enabled', true)
        ->where('lattice.i18n.saveMissing', true)
        ->missing('lattice.i18n.loadPath')
        ->missing('lattice.i18n.addPath'),
    );
});

it('serves the bundled English lattice namespace from the package lang dir', function () {
    getJson('/locales/en/lattice.json')
        ->assertOk()
        ->assertJsonPath('editor.bold', 'Bold')
        ->assertJsonPath('pagination.next', 'Next')
        ->assertJsonPath('operators.eq', 'equals');
});

it('serves the lattice namespace from the package lang dir as nested i18next JSON', function () {
    getJson('/locales/de/lattice.json')
        ->assertOk()
        ->assertJsonPath('editor.bold', 'Fett')
        ->assertJsonPath('editor.heading-1', 'Überschrift 1')
        ->assertJsonPath('pagination.next', 'Weiter')
        ->assertJsonPath('operators.eq', 'ist gleich')
        ->assertJsonPath('a11y.selectRow', 'Zeile {{key}} auswählen')
        ->assertJsonPath('bulk.selected', '{{count}} ausgewählt');
});

it('serves workbench translations from the workbench lang dir', function () {
    getJson('/locales/en/workbench::workbench.json')
        ->assertOk()
        ->assertJsonPath('pages.products.title', 'Products')
        ->assertJsonPath('forms.product.fields.name', 'Name');

    getJson('/locales/de/workbench::workbench.json')
        ->assertOk()
        ->assertJsonPath('pages.products.title', 'Produkte')
        ->assertJsonPath('forms.product.fields.name', 'Name');
});

it('keeps workbench translation keys aligned between English and German', function () {
    $english = require package_path('workbench/lang/en/workbench.php');
    $german = require package_path('workbench/lang/de/workbench.php');

    expect(array_keys($english))
        ->not->toBeEmpty()
        ->and(array_keys($german))
        ->toBe(array_keys($english));

    expect(array_keys(Arr::dot($german)))
        ->toBe(array_keys(Arr::dot($english)));
});

it('dumps missing lattice keys into the package lang dir, never vendor', function () {
    postJson('/locales/add/zz/lattice', ['editor.demo' => 'editor.demo'])->assertOk();

    $file = package_path('lang/zz/lattice.php');

    expect($file)->toBeReadableFile()
        ->and(str_contains($file, '/vendor/'))->toBeFalse()
        ->and(str_contains($file, '/workbench/'))->toBeFalse();

    expect(require $file)->toBe(['editor' => ['demo' => 'i18next-editor.demo']]);
});

it('dumps namespace-less keys to a JSON file in the package lang dir', function () {
    postJson('/locales/add/zz/translation', ['Save changes' => 'Save changes'])->assertOk();

    $file = package_path('lang/zz.json');

    expect($file)->toBeReadableFile()
        ->and(str_contains($file, '/vendor/'))->toBeFalse();

    expect(json_decode(File::get($file), true))->toBe(['Save changes' => 'i18next-Save changes']);
});

it('dumps missing workbench keys into the workbench lang dir', function () {
    postJson('/locales/add/zz/workbench::workbench', ['language.demo' => 'language.demo'])->assertOk();

    $file = package_path('workbench/lang/zz/workbench.php');

    expect($file)->toBeReadableFile()
        ->and(str_contains($file, '/vendor/'))->toBeFalse()
        ->and(str_contains($file, '/workbench/lang/'))->toBeTrue();

    expect(require $file)->toBe(['language' => ['demo' => 'i18next-language.demo']]);
});
