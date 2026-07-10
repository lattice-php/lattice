<?php
declare(strict_types=1);

namespace Workbench\App\Models;

use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Lattice\Lattice\Core\Contracts\HasTimezonePreference;

/**
 * @property string|null $locale
 * @property string|null $timezone
 */
class User extends Authenticatable implements HasLocalePreference, HasTimezonePreference
{
    use Notifiable;

    protected $table = 'users';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'locale',
        'timezone',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'locale' => 'en',
    ];

    public function preferredLocale(): ?string
    {
        $locale = $this->getAttribute('locale');

        return is_string($locale) && $locale !== '' ? $locale : null;
    }

    public function preferredTimezone(): ?string
    {
        $timezone = $this->getAttribute('timezone');

        return is_string($timezone) && $timezone !== '' ? $timezone : null;
    }

    /**
     * @return array<string, string>
     */
    #[\Override]
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'locale' => 'string',
            'timezone' => 'string',
        ];
    }
}
