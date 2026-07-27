<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Breadcrumb;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Ui\Components\Text;

test('a title set on the schema wins over the title method', function (): void {
    $page = new class extends Page
    {
        public function title(): string
        {
            return 'Method title';
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->title('Schema title')->component(Text::make('Body'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->toMatchArray(['title' => 'Schema title']);
});

test('the title method still applies when the schema sets nothing', function (): void {
    $page = new class extends Page
    {
        public function title(): string
        {
            return 'Method title';
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('Body'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request))
        ->toMatchArray(['title' => 'Method title']);
});

test('breadcrumbs set on the schema win over the breadcrumbs method', function (): void {
    $page = new class extends Page
    {
        public function breadcrumbs(): array
        {
            return [Breadcrumb::make('Method', '/method')];
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema
                ->breadcrumbs([Breadcrumb::make('Schema', '/schema')])
                ->component(Text::make('Body'));
        }
    };

    expect(wire($page->toArray($page->render(PageSchema::make()), new Request)['breadcrumbs']))
        ->toBe([['title' => 'Schema', 'href' => '/schema']]);
});

test('an empty breadcrumb array on the schema clears the method breadcrumbs', function (): void {
    $page = new class extends Page
    {
        public function breadcrumbs(): array
        {
            return [Breadcrumb::make('Method', '/method')];
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->breadcrumbs([])->component(Text::make('Body'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request)['breadcrumbs'])
        ->toBe([]);
});
