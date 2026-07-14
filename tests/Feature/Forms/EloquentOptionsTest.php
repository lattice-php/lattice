<?php
declare(strict_types=1);

use Illuminate\Database\Eloquent\Model;
use Lattice\Lattice\Core\EloquentOptions;
use Lattice\Lattice\Core\Option;
use Workbench\App\Models\Product;

/** A model keyed by a non-`id` column (reuses the products table, keyed on its unique sku). */
final class SkuKeyedProduct extends Model
{
    protected $table = 'products';

    protected $primaryKey = 'sku';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];
}

it('searches an eloquent model by its label column', function (): void {
    Product::factory()->create(['name' => 'Alpha Chair']);
    Product::factory()->create(['name' => 'Beta Table']);

    $options = EloquentOptions::make(Product::class)->label('name')->search('chair');

    expect($options)->toHaveCount(1)
        ->and($options[0]->label)->toBe('Alpha Chair');
});

it('returns the initial set (ordered by label) for an empty query, capped by the limit', function (): void {
    foreach (['Cedar', 'Alder', 'Birch'] as $name) {
        Product::factory()->create(['name' => $name]);
    }

    $options = EloquentOptions::make(Product::class)->label('name')->limit(2)->search('');

    expect(array_map(fn (Option $o): string => $o->label, $options))->toBe(['Alder', 'Birch']);
});

it('resolves selected values to their labels and keys', function (): void {
    $product = Product::factory()->create(['name' => 'Gamma Shelf']);

    $options = EloquentOptions::make(Product::class)->label('name')->selected([(string) $product->getKey()]);

    expect($options)->toHaveCount(1)
        ->and($options[0]->label)->toBe('Gamma Shelf')
        ->and($options[0]->value)->toBe((string) $product->getKey());
});

it('defaults the value column to the model key for a non-id primary key', function (): void {
    Product::factory()->create(['name' => 'Keyed', 'sku' => 'SKU-XYZ']);

    $source = EloquentOptions::make(SkuKeyedProduct::class)->label('name');

    $selected = $source->selected(['SKU-XYZ']);
    expect($selected)->toHaveCount(1)
        ->and($selected[0]->label)->toBe('Keyed')
        ->and($selected[0]->value)->toBe('SKU-XYZ');

    expect($source->search('keyed')[0]->value)->toBe('SKU-XYZ');
});

it('applies a query scope to both search and selected', function (): void {
    Product::factory()->create(['name' => 'Visible', 'status' => 'active']);
    $hidden = Product::factory()->create(['name' => 'Hidden', 'status' => 'archived']);

    $source = EloquentOptions::make(Product::class)
        ->label('name')
        ->scope(fn ($query) => $query->where('status', 'active'));

    expect($source->search(''))->toHaveCount(1)
        ->and($source->selected([(string) $hidden->getKey()]))->toBe([]);
});

it('attaches per-option data from columns', function (): void {
    Product::factory()->create(['name' => 'Alpha Chair', 'sku' => 'SKU-1', 'status' => 'active']);

    $options = EloquentOptions::make(Product::class)
        ->label('name')
        ->data(['sku', 'status'])
        ->search('alpha');

    expect($options[0]->data)->toBe(['sku' => 'SKU-1', 'status' => 'active']);
});

it('attaches per-option data from a closure, on search and selected alike', function (): void {
    $product = Product::factory()->create(['name' => 'Beta Table', 'sku' => 'SKU-2']);

    $source = EloquentOptions::make(Product::class)
        ->label('name')
        ->data(fn ($product): array => ['badge' => mb_strtolower($product->sku)]);

    expect($source->search('beta')[0]->data)->toBe(['badge' => 'sku-2'])
        ->and($source->selected([(string) $product->getKey()])[0]->data)->toBe(['badge' => 'sku-2']);
});

it('omits option data when none is configured', function (): void {
    Product::factory()->create(['name' => 'Gamma Shelf']);

    expect(EloquentOptions::make(Product::class)->label('name')->search('gamma')[0]->data)->toBeNull();
});
