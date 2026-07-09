<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final readonly class BooleanFilterValue implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_scalar($value) || filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) === null) {
            $fail("The {$attribute} field contains an invalid filter value.");
        }
    }
}
