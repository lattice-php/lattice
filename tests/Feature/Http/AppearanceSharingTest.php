<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\PageSchema;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    Route::get('appearance-probe', [AppearanceProbePage::class, 'render'])->middleware('web')->name('appearance-probe.show');

    withoutVite();
});

it('shares the plain appearance cookie so the server render can match the theme', function (): void {
    $this->withCredentials()->withUnencryptedCookie('appearance', 'dark');

    get('/appearance-probe')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('lattice.appearance', 'dark')
            ->where('lattice.urls.refreshRef', route('lattice.refs.refresh', absolute: false))
        );
});

it('shares null when no appearance cookie is present', function (): void {
    get('/appearance-probe')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('lattice.appearance', null)
        );
});

it('ignores appearance cookie values outside the known modes', function (): void {
    $this->withCredentials()->withUnencryptedCookie('appearance', 'sepia');

    get('/appearance-probe')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('lattice.appearance', null)
        );
});

final class AppearanceProbePage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Appearance probe'));
    }
}
