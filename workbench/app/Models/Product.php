<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Workbench\App\Factories\ProductFactory;

/**
 * @property string $name
 * @property string $sku
 * @property string $status
 * @property bool $featured
 * @property-read Collection<int, Product> $relatedProducts
 * @property-read Collection<int, SalesPrice> $salesPrices
 * @property-read SalesPrice|null $defaultSalesPrice
 */
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'sku',
        'status',
        'featured',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
        ];
    }

    /**
     * @return BelongsToMany<Product, $this>
     */
    public function relatedProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'product_related',
            'product_id',
            'related_product_id',
        );
    }

    /** @return HasMany<SalesPrice, $this> */
    public function salesPrices(): HasMany
    {
        return $this->hasMany(SalesPrice::class);
    }

    /** @return HasOne<SalesPrice, $this> */
    public function defaultSalesPrice(): HasOne
    {
        return $this->hasOne(SalesPrice::class)->whereNull('group_id');
    }

    protected static function newFactory(): ProductFactory
    {
        return ProductFactory::new();
    }
}
