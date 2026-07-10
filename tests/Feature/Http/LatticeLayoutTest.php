<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsLayout;
use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Http\Page;
use Lattice\Lattice\Layouts\Components\Outlet;
use Lattice\Lattice\Layouts\LayoutDefinition;
use Lattice\Lattice\Layouts\LayoutRegistry;

#[AsLayout('app')]
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

#[AsPage(layout: 'app')]
final class WorkbenchLayoutPage extends Page
{
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

test('the layout registry resolves a registered layout to its wire schema', function (): void {
    Lattice::layouts([WorkbenchAppLayout::class]);

    $rendered = app(LayoutRegistry::class)->render('app', new Request);
    $schema = wire($rendered['schema']);

    expect($rendered['key'])->toBe('app')
        ->and($schema[0]['type'])->toBe('stack')
        ->and($schema[0]['key'])->toBe('app-shell')
        ->and($schema[0]['schema'][0]['type'])->toBe('heading')
        ->and($schema[0]['schema'][1]['type'])->toBe('outlet');
});

test('the layout registry rejects an unregistered layout key', function (): void {
    expect(fn () => app(LayoutRegistry::class)->render('missing', new Request))
        ->toThrow(UnknownComponent::class);
});

test('a page serializes its layout as key and schema with an outlet', function (): void {
    Lattice::layouts([WorkbenchAppLayout::class]);

    $page = new WorkbenchLayoutPage;

    $payload = wire($page->toArray($page->render(PageSchema::make()), new Request));

    expect($payload['layout']['key'])->toBe('app')
        ->and($payload['layout']['schema'][0]['type'])->toBe('stack')
        ->and($payload['layout']['schema'][0]['schema'][1]['type'])->toBe('outlet')
        ->and($payload['schema'][0])->toMatchArray([
            'type' => 'text',
            'props' => ['text' => 'Page body', 'align' => null, 'size' => 'md', 'color' => null, 'copyable' => false],
        ]);
});

test('a page without a layout serializes a null layout', function (): void {
    $page = new WorkbenchStandalonePage;

    $payload = $page->toArray($page->render(PageSchema::make()), new Request);

    expect($payload['layout'])->toBeNull();
});

test('the none layout sentinel serializes a null layout', function (): void {
    $page = new class extends Page
    {
        public function render(PageSchema $schema): PageSchema
        {
            return $schema->component(Text::make('body'));
        }
    };

    expect($page->toArray($page->render(PageSchema::make()), new Request)['layout'])->toBeNull();
});
