<?php

declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Workbench\App\Factories\ProductFactory;

/**
 * @property string $name
 * @property string $sku
 * @property string $price
 * @property string $status
 * @property bool $featured
 * @property-read Collection<int, Product> $relatedProducts
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
        'price',
        'status',
        'featured',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
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

    protected static function newFactory(): ProductFactory
    {
        return ProductFactory::new();
    }
}
