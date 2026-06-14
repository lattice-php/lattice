<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Workbench\App\Factories\SalesPriceFactory;

/**
 * @property int $product_id
 * @property int|null $group_id
 * @property string $amount
 */
class SalesPrice extends Model
{
    /** @use HasFactory<SalesPriceFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['product_id', 'group_id', 'amount'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['amount' => 'decimal:2'];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<Group, $this> */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    protected static function newFactory(): SalesPriceFactory
    {
        return SalesPriceFactory::new();
    }
}
