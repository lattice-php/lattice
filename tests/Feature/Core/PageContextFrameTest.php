<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Lattice\Core\Attributes\AsLayout;
use Lattice\Core\Attributes\AsPage;
use Lattice\Core\Facades\Lattice;
use Lattice\Http\Page;
use Lattice\Layouts\LayoutDefinition;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\PageSchema;
use Workbench\App\Models\Product;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    Lattice::context('product', Product::class);

    FrameChildTable::$seen = [];
    FrameLayoutTable::$seen = [];

    Lattice::tables([FrameChildTable::class, FrameLayoutTable::class]);

    withoutVite();
});

test('a route parameter bound to a resolver model seeds the context frame under its registered key, regardless of the parameter name', function (): void {
    $product = Product::factory()->create(['name' => 'Frame Widget']);

    Route::get('/frame/{current_product}', [FrameByModelPage::class, 'render'])
        ->middleware('web')
        ->name('frame-test.by-model');

    get('/frame/'.$product->getKey())->assertOk();

    expect(FrameChildTable::$seen['scalar'])->toBe($product->getRouteKey())
        ->and(FrameChildTable::$seen['model_name'])->toBe('Frame Widget');
});

test('a scalar route parameter named for a registered key seeds the context frame', function (): void {
    $product = Product::factory()->create(['name' => 'Scalar Widget']);

    Route::get('/frame-scalar/{product}', [FrameByScalarPage::class, 'render'])
        ->middleware('web')
        ->name('frame-test.by-scalar');

    get('/frame-scalar/'.$product->getKey())->assertOk();

    expect(FrameChildTable::$seen['scalar'])->toBe((string) $product->getRouteKey())
        ->and(FrameChildTable::$seen['model_name'])->toBe('Scalar Widget');
});

test('PageSchema::context() overrides the route-seeded key', function (): void {
    $routeProduct = Product::factory()->create(['name' => 'Route Widget']);
    FrameOverridePage::$override = Product::factory()->create(['name' => 'Override Widget']);

    Route::get('/frame-override/{product}', [FrameOverridePage::class, 'render'])
        ->middleware('web')
        ->name('frame-test.override');

    get('/frame-override/'.$routeProduct->getKey())->assertOk();

    expect(FrameChildTable::$seen['model_name'])->toBe('Override Widget');
});

test('a layout rendered for the page inherits its context frame', function (): void {
    $product = Product::factory()->create(['name' => 'Layout Widget']);

    Lattice::layouts([FrameLayout::class]);

    Route::get('/frame-layout/{product}', [FrameLayoutPage::class, 'render'])
        ->middleware('web')
        ->name('frame-test.layout');

    get('/frame-layout/'.$product->getKey())->assertOk();

    expect(FrameLayoutTable::$seen['model_name'])->toBe('Layout Widget');
});

test('callAction seeds the context frame for a page action', function (): void {
    $product = Product::factory()->create(['name' => 'Action Widget']);

    Route::get('/frame-action/{product}/search', [FrameByScalarPage::class, 'search'])
        ->middleware('web')
        ->name('frame-test.search');

    get('/frame-action/'.$product->getKey().'/search')->assertOk();

    expect(FrameChildTable::$seen['scalar'])->toBe((string) $product->getRouteKey())
        ->and(FrameChildTable::$seen['model_name'])->toBe('Action Widget');
});

#[AsTable('frame-test.child-table')]
final class FrameChildTable extends TableDefinition
{
    /** @var array<string, mixed> */
    public static array $seen = [];

    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([]));
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        self::$seen['scalar'] = $this->context('product');

        $product = $this->contextModelOrNull('product');
        self::$seen['model_name'] = $product instanceof Product ? $product->name : null;

        return true;
    }
}

#[AsTable('frame-test.layout-table')]
final class FrameLayoutTable extends TableDefinition
{
    /** @var array<string, mixed> */
    public static array $seen = [];

    public function columns(): array
    {
        return [TextColumn::make('name')];
    }

    public function source(): TableSource
    {
        return new CallbackTableSource(fn (TableQuery $query): TableResult => TableResult::make([]));
    }

    #[Override]
    public function authorize(Request $request): bool
    {
        $product = $this->contextModelOrNull('product');
        self::$seen['model_name'] = $product instanceof Product ? $product->name : null;

        return true;
    }
}

#[AsPage(middleware: 'web')]
final class FrameByModelPage extends Page
{
    public function render(PageSchema $schema, Product $current_product): PageSchema
    {
        return $schema->schema([
            Table::use(FrameChildTable::class),
        ]);
    }
}

#[AsPage(middleware: 'web')]
final class FrameByScalarPage extends Page
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Table::use(FrameChildTable::class),
        ]);
    }

    public function search(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Table::use(FrameChildTable::class),
        ]);
    }
}

#[AsPage(middleware: 'web')]
final class FrameOverridePage extends Page
{
    public static ?Product $override = null;

    public function render(PageSchema $schema, Product $product): PageSchema
    {
        return $schema
            ->context(['product' => self::$override])
            ->schema([
                Table::use(FrameChildTable::class),
            ]);
    }
}

#[AsLayout('frame-test.layout')]
final class FrameLayout extends LayoutDefinition
{
    public function schema(PageSchema $schema, Request $request): PageSchema
    {
        return $schema->schema([
            Table::use(FrameLayoutTable::class),
        ]);
    }
}

#[AsPage(layout: 'frame-test.layout', middleware: 'web')]
final class FrameLayoutPage extends Page
{
    public function render(PageSchema $schema, Product $product): PageSchema
    {
        return $schema->schema([]);
    }
}
