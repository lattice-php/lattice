<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Workbench\App\Factories\BusinessPartnerFactory;

/**
 * @property string $name
 * @property string|null $email
 * @property int|null $default_shipping_address_id
 * @property int|null $default_billing_address_id
 * @property-read Collection<int, Group> $groups
 * @property-read Collection<int, Address> $addresses
 * @property-read Collection<int, SalesOrder> $salesOrders
 * @property-read Collection<int, Note> $notes
 * @property-read Note|null $internalNote
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

    /** @return MorphMany<Note, $this> */
    public function notes(): MorphMany
    {
        return $this->morphMany(Note::class, 'notable');
    }

    /**
     * Scoped to `type = 'internal'` on purpose — this is the fixture a
     * {@see RelationColumn} test uses to prove sorting/filtering through a
     * `MorphOne` preserves an extra `where()` alongside the morph type
     * constraint, not just the polymorphic wiring itself.
     *
     * @return MorphOne<Note, $this>
     */
    public function internalNote(): MorphOne
    {
        return $this->morphOne(Note::class, 'notable')->where('type', 'internal');
    }

    protected static function newFactory(): BusinessPartnerFactory
    {
        return BusinessPartnerFactory::new();
    }
}
