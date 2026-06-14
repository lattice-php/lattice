<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Workbench\App\Factories\BusinessPartnerFactory;

/**
 * @property string $name
 * @property string|null $email
 * @property int|null $default_shipping_address_id
 * @property int|null $default_billing_address_id
 * @property-read Collection<int, Group> $groups
 * @property-read Collection<int, Address> $addresses
 * @property-read Collection<int, SalesOrder> $salesOrders
 */
class BusinessPartner extends Model
{
    /** @use HasFactory<BusinessPartnerFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['name', 'email', 'default_shipping_address_id', 'default_billing_address_id'];

    /** @return BelongsToMany<Group, $this> */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'business_partner_group');
    }

    /** @return HasMany<Address, $this> */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /** @return BelongsTo<Address, $this> */
    public function defaultShippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'default_shipping_address_id');
    }

    /** @return BelongsTo<Address, $this> */
    public function defaultBillingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'default_billing_address_id');
    }

    /** @return HasMany<SalesOrder, $this> */
    public function salesOrders(): HasMany
    {
        return $this->hasMany(SalesOrder::class);
    }

    protected static function newFactory(): BusinessPartnerFactory
    {
        return BusinessPartnerFactory::new();
    }
}
