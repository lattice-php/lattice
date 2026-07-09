<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final readonly class AllowedFilterValues implements ValidationRule
{
    /**
     * @param  list<string>  $allowed
     */
    public function __construct(
        private array $allowed,
        private bool $multiple,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $values = $this->multiple ? (is_array($value) ? $value : [$value]) : [$value];

        foreach ($values as $item) {
            if (! in_array((string) $item, $this->allowed, true)) {
                $fail("The {$attribute} field contains an invalid filter value.");

                return;
            }
        }
    }
}
