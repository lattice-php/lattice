<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Core\Facades\Lattice;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\CallbackTableSource;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\TableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Table\TableResult;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Stack;
use Lattice\Ui\Slot;
use Workbench\App\Models\Product;

beforeEach(function (): void {
    Lattice::context('product', Product::class);
    Lattice::tables([SlotContextProductTable::class]);

    SlotContextProductTable::$seenProductName = null;
});

test('a slot extension runs inside the inherited context frame, and its factory still receives the raw model by injection', function (): void {
    $product = Product::factory()->create(['name' => 'Slot Widget']);
    $injected = null;

    Lattice::extend('product.settings.tabs', function (Product $product) use (&$injected): Component {
        $injected = $product;

        return Stack::make('slot-stack')->schema([
            Table::lazy(SlotContextProductTable::class),
        ]);
    });

    Slot::make('product.settings.tabs')->context(['product' => $product])->resolveComponents();

    expect($injected)->toBe($product)
        ->and(SlotContextProductTable::$seenProductName)->toBe('Slot Widget');
});

test('a slot context carrying an unregistered object does not throw and is not inherited', function (): void {
    $arbitrary = new class
    {
        public string $marker = 'unregistered';
    };

    Lattice::extend('gizmo.settings.tabs', fn (): Component => Table::lazy(SlotContextProductTable::class));

    expect(fn (): array => Slot::make('gizmo.settings.tabs')->context(['gizmo' => $arbitrary])->resolveComponents())
        ->not->toThrow(Throwable::class);

    expect(SlotContextProductTable::$seenProductName)->toBeNull();
});

#[AsTable('slot-context.product-table')]
final class SlotContextProductTable extends TableDefinition
{
    public static ?string $seenProductName = null;

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
        self::$seenProductName = $product instanceof Product ? $product->name : null;

        return true;
    }
}
