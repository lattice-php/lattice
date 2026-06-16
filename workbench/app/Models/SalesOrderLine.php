<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Workbench\App\Factories\SalesOrderLineFactory;

/**
 * @property int $sales_order_id
 * @property int $product_id
 * @property int $quantity
 * @property string $unit_price
 */
class SalesOrderLine extends Model
{
    /** @use HasFactory<SalesOrderLineFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['sales_order_id', 'product_id', 'quantity', 'unit_price'];

    /** @return array<string, string> */
    #[\Override]
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<SalesOrder, $this> */
    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function total(): string
    {
        return bcmul($this->unit_price, (string) $this->quantity, 2);
    }

    protected static function newFactory(): SalesOrderLineFactory
    {
        return SalesOrderLineFactory::new();
    }
}
