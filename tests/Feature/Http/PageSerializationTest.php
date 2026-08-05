<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Breadcrumb;
use Lattice\Core\Enums\PageContainer;
use Lattice\Core\Enums\PageLayout;
use Lattice\Http\Page;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

test('pages serialize layout and container metadata', function (): void {
    $defaultPage = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Default page'));
        }
    };

    $configuredPage = new #[AsPage(container: PageContainer::Default)] class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Configured page'));
        }
    };

    expect($defaultPage->toArray($defaultPage->render(PageSchema::make()), new Request))
        ->toMatchArray(['layout' => null, 'container' => 'centered'])
        ->and($configuredPage->toArray($configuredPage->render(PageSchema::make()), new Request))
        ->toMatchArray(['layout' => null, 'container' => 'default']);
});

test('page array serialization keeps the public contract narrow', function (): void {
    $parameters = array_map(
        static fn (ReflectionParameter $parameter): string => $parameter->getName(),
        new ReflectionMethod(Page::class, 'toArray')->getParameters(),
    );

    expect($parameters)->toBe(['schema', 'request']);
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

test('the container() method takes precedence over the page attribute', function (): void {
    $page = new #[AsPage(container: PageContainer::Default)] class extends Page
    {
        public function container(): PageContainer
        {
            return PageContainer::Centered;
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Method container'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->toMatchArray(['container' => 'centered']);
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
