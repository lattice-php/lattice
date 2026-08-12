<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Breadcrumb;
use Lattice\Core\Enums\PageLayout;
use Lattice\Core\Enums\PageWidth;
use Lattice\Http\Page;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

test('pages serialize layout and width metadata', function (): void {
    $defaultPage = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Default page'));
        }
    };

    $configuredPage = new #[AsPage(width: PageWidth::Medium)] class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Configured page'));
        }
    };

    expect($defaultPage->toArray($defaultPage->render(PageSchema::make()), new Request))
        ->toMatchArray(['layout' => null, 'width' => 'full'])
        ->and($configuredPage->toArray($configuredPage->render(PageSchema::make()), new Request))
        ->toMatchArray(['layout' => null, 'width' => 'md']);
});

test('the layout() method takes precedence over the page attribute', function (): void {
    $page = new #[AsPage(layout: PageLayout::App)] class extends Page
    {
        public function layout(): PageLayout
        {
            return PageLayout::None;
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Method layout'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->toMatchArray(['layout' => null]);
});

test('the width() method takes precedence over the page attribute', function (): void {
    $page = new #[AsPage(width: PageWidth::Full)] class extends Page
    {
        public function width(): PageWidth
        {
            return PageWidth::Small;
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Method width'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->toMatchArray(['width' => 'sm']);
});

test('pages serialize breadcrumb metadata', function (): void {
    $page = new class extends Page
    {
        public function breadcrumbs(): array
        {
            return [Breadcrumb::make('Dashboard', '/demo/dashboard')];
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Dashboard'));
        }
    };

    $payload = $page->toArray($page->render(PageSchema::make()), new Request);

    expect(wire($payload['breadcrumbs']))
        ->toBe([
            [
                'title' => 'Dashboard',
                'href' => '/demo/dashboard',
            ],
        ]);
});

test('pages do not serialize shared i18n metadata', function (): void {
    $page = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Dashboard'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->not->toHaveKey('i18n');
});
