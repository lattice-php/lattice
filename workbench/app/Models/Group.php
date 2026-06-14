<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Workbench\App\Factories\GroupFactory;

/**
 * @property string $name
 * @property-read Collection<int, BusinessPartner> $businessPartners
 * @property-read Collection<int, SalesPrice> $salesPrices
 */
class Group extends Model
{
    /** @use HasFactory<GroupFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['name'];

    /** @return BelongsToMany<BusinessPartner, $this> */
    public function businessPartners(): BelongsToMany
    {
        return $this->belongsToMany(BusinessPartner::class, 'business_partner_group');
    }

    /** @return HasMany<SalesPrice, $this> */
    public function salesPrices(): HasMany
    {
        return $this->hasMany(SalesPrice::class);
    }

    protected static function newFactory(): GroupFactory
    {
        return GroupFactory::new();
    }
}
