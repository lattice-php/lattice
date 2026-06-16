<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Workbench\App\Enums\SalesOrderStatus;
use Workbench\App\Factories\SalesOrderFactory;

/**
 * @property int $business_partner_id
 * @property string $number
 * @property SalesOrderStatus $status
 * @property int|null $shipping_address_id
 * @property int|null $billing_address_id
 * @property-read Collection<int, SalesOrderLine> $lines
 */
class SalesOrder extends Model
{
    /** @use HasFactory<SalesOrderFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['business_partner_id', 'number', 'status', 'shipping_address_id', 'billing_address_id'];

    /** @return array<string, string> */
    #[\Override]
    protected function casts(): array
    {
        return ['status' => SalesOrderStatus::class];
    }

    /** @return BelongsTo<BusinessPartner, $this> */
    public function businessPartner(): BelongsTo
    {
        return $this->belongsTo(BusinessPartner::class);
    }

    /** @return HasMany<SalesOrderLine, $this> */
    public function lines(): HasMany
    {
        return $this->hasMany(SalesOrderLine::class);
    }

    /** @return BelongsTo<Address, $this> */
    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    /** @return BelongsTo<Address, $this> */
    public function billingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    public function total(): string
    {
        return $this->lines->reduce(
            fn (string $carry, SalesOrderLine $line): string => bcadd($carry, $line->total(), 2),
            '0.00',
        );
    }

    protected static function newFactory(): SalesOrderFactory
    {
        return SalesOrderFactory::new();
    }
}
