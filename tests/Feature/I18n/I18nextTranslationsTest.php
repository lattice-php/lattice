<?php
declare(strict_types=1);

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Inertia\Support\Header;
use Inertia\Testing\AssertableInertia;

use function Orchestra\Testbench\package_path;
use function Pest\Laravel\get;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\withoutVite;

afterEach(function (): void {
    File::deleteDirectory(package_path('lang/zz'));
    File::deleteDirectory(package_path('workbench/lang/zz'));
    File::delete(package_path('lang/zz.json'));
});

it('shares the i18n config to the frontend as a once prop', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    $response = get('/');

    $response->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->where('lattice.i18n.enabled', true)
        ->where('lattice.i18n.saveMissing', true)
        ->where('lattice.i18n.locales', ['en', 'de'])
        ->where('lattice.i18n.preloadLocales', ['en', 'de'])
        ->missing('lattice.i18n.loadPath')
        ->missing('lattice.i18n.addPath'),
    );

    $page = json_decode(json_encode($response->viewData('page'), JSON_THROW_ON_ERROR), true, flags: JSON_THROW_ON_ERROR);

    expect($page['onceProps']['lattice.i18n']['prop'] ?? null)->toBe('lattice.i18n');
});

it('omits the i18n config when the client already has the once prop', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    $response = get('/');
    $page = json_decode(json_encode($response->viewData('page'), JSON_THROW_ON_ERROR), true, flags: JSON_THROW_ON_ERROR);

    $response = get('/', [
        Header::INERTIA => 'true',
        Header::VERSION => (string) ($page['version'] ?? ''),
        Header::EXCEPT_ONCE_PROPS => 'lattice.i18n',
    ]);

    $response
        ->assertOk()
        ->assertJsonMissingPath('props.lattice.i18n');

    expect($response->json('onceProps.lattice.i18n.prop'))->toBeNull()
        ->and($response->json('onceProps')['lattice.i18n']['prop'] ?? null)->toBe('lattice.i18n');
});

it('serves the bundled English lattice namespace from the package lang dir', function (): void {
    getJson('/locales/en/lattice.json')
        ->assertOk()
        ->assertJsonPath('editor.bold', 'Bold')
        ->assertJsonPath('pagination.next', 'Next')
        ->assertJsonPath('operators.eq', 'equals');
});

it('serves the lattice namespace from the package lang dir as nested i18next JSON', function (): void {
    getJson('/locales/de/lattice.json')
        ->assertOk()
        ->assertJsonPath('editor.bold', 'Fett')
        ->assertJsonPath('editor.heading-1', 'Überschrift 1')
        ->assertJsonPath('pagination.next', 'Weiter')
        ->assertJsonPath('operators.eq', 'ist gleich')
        ->assertJsonPath('a11y.selectRow', 'Zeile {{key}} auswählen')
        ->assertJsonPath('bulk.selected', '{{count}} ausgewählt');
});

it('serves workbench translations from the workbench lang dir', function (): void {
    getJson('/locales/en/workbench::workbench.json')
        ->assertOk()
        ->assertJsonPath('pages.products.title', 'Products')
        ->assertJsonPath('forms.product.fields.name', 'Name');

    getJson('/locales/de/workbench::workbench.json')
        ->assertOk()
        ->assertJsonPath('pages.products.title', 'Produkte')
        ->assertJsonPath('forms.product.fields.name', 'Name');
});

it('localizes workbench page props and table column labels from the accept language header', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser(['locale' => 'de']));

    $response = get('/products', ['Accept-Language' => 'de'])->assertOk();

    $response->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
        ->component('lattice/page', false)
        ->where('lattice.title', 'Produkte'));

    $this->assertLatticePage($response)
        ->component('stack', 'products-header', fn ($header) => $header
            ->component('heading', tap: fn ($heading) => $heading->assertProp('text', 'Produkte')))
        ->component('table', 'workbench.products', fn ($table) => $table->assertProps([
            'columns.0.label' => 'Bild',
            'columns.3.label' => 'Standardpreis',
            'columns.5.label' => 'Hervorgehoben',
            'columns.6.label' => 'Aktualisiert am',
        ]));
});

it('keeps workbench translation keys aligned between English and German', function (): void {
    $english = require package_path('workbench/lang/en/workbench.php');
    $german = require package_path('workbench/lang/de/workbench.php');

    expect(array_keys($english))
        ->not->toBeEmpty()
        ->and(array_keys($german))
        ->toBe(array_keys($english));

    expect(array_keys(Arr::dot($german)))
        ->toBe(array_keys(Arr::dot($english)));
});

it('dumps missing lattice keys into the package lang dir, never vendor', function (): void {
    postJson('/locales/add/zz/lattice', ['editor.demo' => 'editor.demo'])->assertOk();

    $file = package_path('lang/zz/lattice.php');

    expect($file)->toBeReadableFile()
        ->and(str_contains($file, '/vendor/'))->toBeFalse()
        ->and(str_contains($file, '/workbench/'))->toBeFalse();

    expect(require $file)->toBe(['editor' => ['demo' => 'i18next-editor.demo']]);
});

it('dumps namespace-less keys to a JSON file in the package lang dir', function (): void {
    postJson('/locales/add/zz/translation', ['Save changes' => 'Save changes'])->assertOk();

    $file = package_path('lang/zz.json');

    expect($file)->toBeReadableFile()
        ->and(str_contains($file, '/vendor/'))->toBeFalse();

    expect(json_decode(File::get($file), true))->toBe(['Save changes' => 'i18next-Save changes']);
});

it('dumps missing workbench keys into the workbench lang dir', function (): void {
    postJson('/locales/add/zz/workbench::workbench', ['language.demo' => 'language.demo'])->assertOk();

    $file = package_path('workbench/lang/zz/workbench.php');

    expect($file)->toBeReadableFile()
        ->and(str_contains($file, '/vendor/'))->toBeFalse()
        ->and(str_contains($file, '/workbench/lang/'))->toBeTrue();

    expect(require $file)->toBe(['language' => ['demo' => 'i18next-language.demo']]);
});
