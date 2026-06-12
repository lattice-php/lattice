<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

use function Orchestra\Testbench\package_path;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

afterEach(function () {
    File::deleteDirectory(package_path('lang/zz'));
    File::delete(package_path('lang/zz.json'));
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
