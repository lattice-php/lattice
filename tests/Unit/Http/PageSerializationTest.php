<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\PageContainer;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page;

test('pages serialize layout and container metadata', function () {
    $defaultPage = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Default page'));
        }
    };

    $configuredPage = new #[Lattice\Lattice\Attributes\Page(container: PageContainer::Default)] class extends Page
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

test('pages serialize breadcrumb metadata', function () {
    $page = new class extends Page
    {
        public function breadcrumbs(): array
        {
            return [
                [
                    'title' => 'Dashboard',
                    'href' => '/demo/dashboard',
                ],
            ];
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Dashboard'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->toMatchArray([
            'breadcrumbs' => [
                [
                    'title' => 'Dashboard',
                    'href' => '/demo/dashboard',
                ],
            ],
        ]);
});
