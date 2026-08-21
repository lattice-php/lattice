<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsLayout;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Breadcrumb;
use Lattice\Core\Facades\Lattice;
use Lattice\Http\Page;
use Lattice\Layouts\Components\Outlet;
use Lattice\Layouts\LayoutDefinition;
use Lattice\Ui\BreadcrumbTrail;
use Lattice\Ui\Components\Breadcrumbs;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

#[AsLayout('breadcrumbs-app')]
final class BreadcrumbsAppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Breadcrumbs::make('trail'),
            Outlet::make(),
        ]);
    }
}

#[AsPage(layout: 'breadcrumbs-app')]
final class BreadcrumbsSettingsPage extends Page
{
    public function breadcrumbs(): array
    {
        return [
            Breadcrumb::make('Dashboard', '/dashboard'),
            Breadcrumb::make('Settings', '/dashboard/settings'),
        ];
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Settings body'));
    }
}

test('a breadcrumbs component in a layout serializes the active page trail', function (): void {
    Lattice::layouts([BreadcrumbsAppLayout::class]);

    $page = new BreadcrumbsSettingsPage;

    $payload = wire($page->toArray($page->render(PageSchema::make()), new Request));

    expect($payload['layout']['schema'][0])->toMatchArray([
        'type' => 'breadcrumbs',
        'key' => 'trail',
        'props' => ['items' => [
            ['title' => 'Dashboard', 'href' => '/dashboard'],
            ['title' => 'Settings', 'href' => '/dashboard/settings'],
        ]],
    ])->and($payload['breadcrumbs'])->toBe($payload['layout']['schema'][0]['props']['items']);
});

test('explicit breadcrumb items win over the page trail', function (): void {
    app(BreadcrumbTrail::class)->set([Breadcrumb::make('Page', '/page')]);

    $explicit = wire(Breadcrumbs::make()->items([Breadcrumb::make('Custom', '/custom')]));
    $cleared = wire(Breadcrumbs::make()->items([]));

    expect($explicit['props']['items'])->toBe([['title' => 'Custom', 'href' => '/custom']])
        ->and($cleared['props']['items'])->toBe([]);
});
