<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageRoute;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\PageSchema;

#[AsPage(route: '/route-probe/{product}', name: 'route-probe.show')]
class RouteProbePage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Probe'));
    }
}

test('a page href resolves from its named route', function (): void {
    Route::get('/route-probe/{product}', [RouteProbePage::class, 'render'])->name('route-probe.show');

    expect(PageRoute::href(RouteProbePage::class, ['product' => 7]))->toBe('/route-probe/7');
});

test('a page href still resolves when the route was registered without a name', function (): void {
    Route::get('/route-probe/{product}', [RouteProbePage::class, 'render']);

    expect(PageRoute::href(RouteProbePage::class, ['product' => 7]))->toBe('/route-probe/7');
});

test('a page label defaults to the humanised class name', function (): void {
    expect(PageRoute::label(RouteProbePage::class))->toBe('Route Probe');
});

test('a class that is not a lattice page is rejected', function (): void {
    expect(fn (): string => PageRoute::href(stdClass::class))
        ->toThrow(InvalidArgumentException::class);
});

test('a page without a registered route is rejected', function (): void {
    expect(fn (): string => PageRoute::href(RouteProbePage::class))
        ->toThrow(InvalidArgumentException::class);
});
