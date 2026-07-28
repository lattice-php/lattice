<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Breadcrumb;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Ui\Components\Text;

#[AsPage(route: '/crumb-target/{product}', name: 'crumb-target.show')]
class CrumbTargetPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Target'));
    }
}

test('a breadcrumb is built from a title and href', function (): void {
    $crumb = Breadcrumb::make('Dashboard', '/dashboard');

    expect($crumb->title)->toBe('Dashboard')
        ->and($crumb->href)->toBe('/dashboard');
});

test('a breadcrumb resolves a page route and default title', function (): void {
    Route::get('/crumb-target/{product}', [CrumbTargetPage::class, 'render'])->name('crumb-target.show');

    $crumb = Breadcrumb::toPage(CrumbTargetPage::class, ['product' => 3]);

    expect($crumb->title)->toBe('Crumb Target')
        ->and($crumb->href)->toBe('/crumb-target/3');
});

test('a breadcrumb title can be overridden without losing the href', function (): void {
    Route::get('/crumb-target/{product}', [CrumbTargetPage::class, 'render'])->name('crumb-target.show');

    $crumb = Breadcrumb::toPage(CrumbTargetPage::class, ['product' => 3])->title('Widgets');

    expect($crumb->title)->toBe('Widgets')
        ->and($crumb->href)->toBe('/crumb-target/3');
});

test('a breadcrumb to a page without a route is rejected', function (): void {
    expect(fn (): Breadcrumb => Breadcrumb::toPage(CrumbTargetPage::class))
        ->toThrow(InvalidArgumentException::class);
});
