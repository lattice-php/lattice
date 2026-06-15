<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Workbench\App\Factories\AddressFactory;

/**
 * @property int $business_partner_id
 * @property string $label
 * @property string $line1
 * @property string|null $line2
 * @property string $city
 * @property string $postal_code
 * @property string $country
 */
class Address extends Model
{
    /** @use HasFactory<AddressFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['business_partner_id', 'label', 'line1', 'line2', 'city', 'postal_code', 'country'];

    /** @return BelongsTo<BusinessPartner, $this> */
    public function businessPartner(): BelongsTo
    {
        return $this->belongsTo(BusinessPartner::class);
    }

    public function displayLabel(): string
    {
        return $this->label.' — '.$this->city;
    }

    protected static function newFactory(): AddressFactory
    {
        return AddressFactory::new();
    }
}
