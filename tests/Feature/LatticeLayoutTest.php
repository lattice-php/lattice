<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\Layout;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\PageLayout;
use Lattice\Lattice\Core\Exceptions\UnknownLatticeComponent;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Lattice\Lattice\Layouts\LayoutRegistry;

#[Layout('app')]
final class WorkbenchAppLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Stack::make('app-shell')->schema([
                Heading::make('Workbench'),
                Outlet::make(),
            ]),
        ]);
    }
}

final class WorkbenchLayoutPage extends Page
{
    public function layout(): string
    {
        return 'app';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Page body'));
    }
}

final class WorkbenchStandalonePage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Standalone body'));
    }
}

test('the layout registry resolves a registered layout to its wire schema', function () {
    Lattice::layouts([WorkbenchAppLayout::class]);

    $rendered = app(LayoutRegistry::class)->render('app', new Request);
    $schema = wire($rendered['schema']);

    expect($rendered['key'])->toBe('app')
        ->and($schema[0]['type'])->toBe('stack')
        ->and($schema[0]['key'])->toBe('app-shell')
        ->and($schema[0]['schema'][0]['type'])->toBe('heading')
        ->and($schema[0]['schema'][1]['type'])->toBe('outlet');
});

test('the layout registry rejects an unregistered layout key', function () {
    expect(fn () => app(LayoutRegistry::class)->render('missing', new Request))
        ->toThrow(UnknownLatticeComponent::class);
});

test('a page serializes its layout as key and schema with an outlet', function () {
    Lattice::layouts([WorkbenchAppLayout::class]);

    $page = new WorkbenchLayoutPage;

    $payload = $page->toArray($page->render(PageSchema::make()), new Request);

    expect($payload['layout']['key'])->toBe('app')
        ->and($payload['layout']['schema'][0]['type'])->toBe('stack')
        ->and($payload['layout']['schema'][0]['schema'][1]['type'])->toBe('outlet')
        ->and($payload['schema'][0])->toMatchArray([
            'type' => 'text',
            'props' => ['text' => 'Page body'],
        ]);
});

test('a page without a layout serializes a null layout', function () {
    $page = new WorkbenchStandalonePage;

    $payload = $page->toArray($page->render(PageSchema::make()), new Request);

    expect($payload['layout'])->toBeNull();
});

test('the none layout sentinel serializes a null layout', function () {
    $page = new class extends Page
    {
        public function layout(): PageLayout
        {
            return PageLayout::None;
        }

        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('body'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request)['layout'])->toBeNull();
});
